import OpenAI from "openai";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { streamVideo } from "@/lib/stream-video";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import {
  MessageNewEvent,
  CallEndedEvent,
  CallRecordingReadyEvent,
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
  CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { streamChat } from "@/lib/stream-chat";
import { generatedAvatarUri } from "@/lib/avatar";

const openaiClient = new OpenAI({
  baseURL: process.env.FREE_OPENAI_HOST,
  apiKey: process.env.FREE_OPENAI_API_KEY!,
});

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

const processedEvents = new Set<Date>(); // 用于存储已处理事件的唯一 ID

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "缺少apiKey或signature" },
      { status: 400 }
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "签名验证失败" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "无效的JSON负载" }, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meeting ID" },
        { status: 400 }
      );
    }

    const [existedMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "upcoming")));

    if (!existedMeeting) {
      console.log("Meeting not found or already started:", meetingId);
      return NextResponse.json(
        { error: "Meeting not found or already started" },
        { status: 404 }
      );
    }

    await db
      .update(meetings)
      .set({ status: "active", startedAt: new Date() })
      .where(eq(meetings.id, existedMeeting.id));

    const [existedAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existedMeeting.agentId));

    if (!existedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const call = streamVideo.video.call("default", meetingId);
    const realTimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: existedAgent.id,
    });

    console.log(
      "Updating session with instructions:",
      existedAgent.instructions
    );

    realTimeClient.updateSession({
      instructions: existedAgent.instructions,
    });
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1]; //call_cid 格式为 "type:id"

    if (!meetingId) {
      return NextResponse.json({ error: "缺少meetingId" }, { status: 400 });
    }

    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  } else if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom?.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "缺少meetingId" }, { status: 400 });
    }

    await db
      .update(meetings)
      .set({
        status: "processing",
        endedAt: new Date(),
      })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
  } else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1]; //call_cid 格式为 "type:id"

    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        transcriptUrl: event.call_transcription.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json({ error: "会议未找到" }, { status: 404 });
    }

    await inngest.send({
      name: "meetings/processing",
      data: {
        meetingId: updatedMeeting.id,
        transcriptUrl: updatedMeeting.transcriptUrl,
      },
    });
  } else if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1]; //call_cid 格式为 "type:id"

    await db
      .update(meetings)
      .set({
        recordingUrl: event.call_recording.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning();
  } else if (eventType === "message.new") {
    const event = payload as MessageNewEvent;

    const userId = event.user?.id;
    const channelId = event.channel_id;
    const text = event.message?.text;

    if (processedEvents.has(event.created_at)) {
      console.log("Duplicate event, skipping:", event.created_at);
      return NextResponse.json({ status: "duplicate" });
    }

    processedEvents.add(event.created_at);

    console.log("Received event:", {
      type: event.type,
      id: event.created_at,
    });

    if (!userId || !channelId || !text) {
      return NextResponse.json(
        { error: "缺少必要的消息信息" },
        { status: 400 }
      );
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if (!existingMeeting) {
      return NextResponse.json(
        { error: "对话未找到或未完成" },
        { status: 404 }
      );
    }

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent未找到" }, { status: 404 });
    }

    if (userId !== existingAgent.id) {
      const instructions = `
      你是一名AI助手，帮助用户回顾最近完成的会议。
      以下是根据会议记录生成的会议摘要：
      
      ${existingMeeting.summary}
      
      以下是您作为实时会议助手时的原始指令。请继续遵循这些行为准则，协助用户：
      
      ${existingAgent.instructions}
      
      用户可能会就会议提出问题、请求澄清或要求后续行动。
      始终基于上述会议摘要提供回答。
      
      您还可以访问您与用户之间的最近对话历史记录。利用之前消息的上下文，提供相关、连贯且有帮助的回答。如果用户的问题涉及之前讨论的内容，请务必考虑到这些内容，并保持对话的连贯性。
      
      如果摘要中没有足够的信息来回答问题，请礼貌地告知用户。
      
      请简明扼要、提供帮助，并专注于根据会议和正在进行的对话提供准确的信息。
      `;

      const channel = streamChat.channel("messaging", channelId);
      await channel.watch();

      const previousMessages = channel.state.messages
        .slice(-5)
        .filter((msg) => msg.text && msg.text.trim() !== "")
        .map<ChatCompletionMessageParam>((message) => ({
          role: message.user?.id === existingAgent.id ? "assistant" : "user",
          content: message.text || "",
        }));

      const GPTResponse = await openaiClient.chat.completions.create({
        messages: [
          { role: "system", content: instructions },
          ...previousMessages,
          { role: "user", content: text },
        ],
        model: "gpt-3.5-turbo",
      });

      const GPTResponseText = GPTResponse.choices[0].message.content;

      if (!GPTResponseText) {
        return NextResponse.json(
          {
            error: "未得到GPT响应",
          },
          { status: 400 }
        );
      }

      const avatarUrl = generatedAvatarUri({
        seed: existingAgent.name,
        variant: "botttsNeutral",
      });

      streamChat.upsertUser({
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUrl,
      });

      channel.sendMessage({
        text: GPTResponseText,
        user: {
          id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUrl,
        },
      });
    }
  }
  return NextResponse.json({ status: 200 });
}
