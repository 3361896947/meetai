import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import { eq, inArray } from "drizzle-orm";
import JSONL from "jsonl-parse-stringify";
import { createAgent, openai, TextMessage } from "@inngest/agent-kit";

const summarizer = createAgent({
  name: "summarizer",
  system: `
    你是一名专业的总结专家。你擅长撰写可读性强、简洁明了的内容。你将获得一份会议的转录内容，需要对其进行总结。

    请使用以下的 Markdown 结构输出每份总结：

    ### 概述
    提供一份详细且引人入胜的会议内容总结。重点描述主要功能、用户工作流程以及任何关键要点。使用叙述性风格，完整句子书写。突出产品、平台或讨论中的独特或强大的方面。

    ### 笔记
    将关键内容按主题分为多个部分，并标注时间范围。每个部分用项目符号总结关键点、行动或演示内容。

    示例：
    #### 部分名称
    - 这里展示了主要观点或演示内容
    - 另一个关键见解或互动
    - 提供的后续工具或解释

    #### 下一部分
    - 功能 X 自动完成 Y
    - 提到与 Z 的集成
`.trim(),
  model: openai({
    model: "gpt-3.5-turbo",
    apiKey: process.env.FREE_OPENAI_API_KEY,
    baseUrl: process.env.FREE_OPENAI_HOST,
  }),
});

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text());
    });

    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse<StreamTranscriptItem>(response);
    });

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) => users.map((user) => ({ ...user })));

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) => agents.map((agent) => ({ ...agent })));

      const speakers = [...userSpeakers, ...agentSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id
        );

        if (!speaker)
          return {
            ...item,
            user: {
              name: "Unknown",
            },
          };

        return {
          ...item,
          user: {
            name: speaker.name,
          },
        };
      });
    });

    const { output } = await summarizer.run(
      "总结接下来的transcript内容：" + JSON.stringify(transcriptWithSpeakers)
    );

    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    });
  }
);
