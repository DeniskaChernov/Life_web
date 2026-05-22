import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function LifeIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, graph] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    }),
    prisma.graph.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!user?.onboardingCompleted) {
    if (graph) {
      // Существующий пользователь — тихо помечаем онбординг завершённым
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      });
    } else {
      redirect("/onboarding");
    }
  }

  if (!graph) redirect("/register");

  redirect(`/life/${graph.id}`);
}
