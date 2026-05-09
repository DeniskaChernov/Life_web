import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import type { NextAuthConfig } from "next-auth";

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID?.length) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET?.length);

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email;
      const password = credentials?.password;
      if (!email || !password || typeof email !== "string") return null;

      const { prisma } = await import("@/lib/prisma");
      const bcrypt = await import("bcryptjs");
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.default.compare(String(password), user.passwordHash);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const email = (user?.email ?? token.email) as string | undefined;
        if (!email) return token;

        const { prisma } = await import("@/lib/prisma");
        const { seedDemoGraphForUser } = await import("@/lib/bootstrap-user-graph");

        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          await prisma.$transaction(async (tx) => {
            const u = await tx.user.create({
              data: {
                email,
                name: user?.name ?? null,
                passwordHash: null,
              },
            });
            await seedDemoGraphForUser(tx, u.id);
          });
          dbUser = await prisma.user.findUnique({ where: { email } });
        }

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
        }
        return token;
      }

      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
