"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { authClient } from "@/lib/auth-client"; //导入认证客户端

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const { data: session } = authClient.useSession();

  function handleRegister() {
    authClient.signUp.email(
      { email, name, password },
      {
        onError: (ctx) => {
          alert(ctx.error.message);
        },
        onSuccess: () => {
          alert("注册成功");
        },
      }
    );
  }

  function handleLogin() {
    authClient.signIn.email(
      { email, password },
      {
        onError: (ctx) => {
          alert(ctx.error.message);
        },
        onSuccess: () => {
          alert("登录成功");
        },
      }
    );
  }

  if (session)
    return (
      <div className="p-4 flex flex-col gap-4">
        <p>欢迎, {session.user.name || session.user.email}</p>
        <Button onClick={() => authClient.signOut()}>登出</Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex flex-col gap-4 p-4">
        <Input
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleRegister}>注册</Button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <Input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin}>登录</Button>
      </div>
    </div>
  );
}
