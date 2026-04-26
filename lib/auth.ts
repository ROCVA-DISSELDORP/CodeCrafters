import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import authConfig from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "STUDENT";
        token.username = (user as { username?: string | null }).username ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.sub ?? "");
      session.user.role = (token.role as Role | undefined) ?? "STUDENT";
      session.user.username = (token.username as string | null | undefined) ?? null;
      return session;
    },
  },
});
