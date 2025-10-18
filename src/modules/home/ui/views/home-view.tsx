"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function HomeView() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.hello.queryOptions({ text: "Liao" }));

  return <div className="p-4 flex flex-col gap-4">{data?.greeting}</div>;
}
