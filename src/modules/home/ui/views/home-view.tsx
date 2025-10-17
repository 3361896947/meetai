"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function HomeView() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (!session) return <p>正在加载</p>;

  return (
    <div className="p-4 flex flex-col gap-4">
      <p>欢迎, {session.user.name}</p>
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/sign-in"),
            },
          })
        }
      >
        登出
      </Button>
    </div>
  );
}
