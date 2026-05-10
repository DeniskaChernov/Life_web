import { auth } from "@/auth";
import { Landing } from "@/components/landing/Landing";

export default async function Home() {
  const session = await auth();
  return <Landing isAuthenticated={Boolean(session?.user)} />;
}
