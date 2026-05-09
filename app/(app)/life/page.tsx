import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function LifeIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const graph = await prisma.graph.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (!graph) redirect("/register");

  redirect(`/life/${graph.id}`);
}
