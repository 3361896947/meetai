import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { generatedAvatarUri } from "@/lib/avatar";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
interface Props {
  onJoin: () => void;
}

function DisabledVideoPreview() {
  const { data } = authClient.useSession();

  return (
    <DefaultVideoPlaceholder
      participant={
        {
          name: data?.user.name ?? "",
          image:
            data?.user.image ??
            generatedAvatarUri({
              seed: data?.user.name ?? "",
              variant: "initials",
            }),
        } as StreamVideoParticipant
      }
    />
  );
}

function AllowBrowserPermissions() {
  return (
    <p className="text-sm">请允许浏览器访问您的摄像头和麦克风以加入通话。</p>
  );
}

export function CallLobby({ onJoin }: Props) {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { hasBrowserPermission: hasCamPermission } = useCameraState();

  const hasBrowserMediaPermission = hasMicPermission && hasCamPermission;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-semibold">准备好加入对话了吗</h6>
            <p className="text-sm">在加入之前配置您的Call</p>
          </div>
          <VideoPreview
            DisabledVideoPreview={
              hasBrowserMediaPermission
                ? DisabledVideoPreview
                : AllowBrowserPermissions
            }
          />
          <div className="flex gap-x-2">
            <ToggleAudioPreviewButton />
            <ToggleVideoPreviewButton />
          </div>

          <div className="flex gap-x-2 justify-between w-full">
            <Button asChild variant="outline">
              <Link href="/meetings">取消</Link>
            </Button>
            <Button onClick={onJoin}>
              <LogInIcon />
              加入对话
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
