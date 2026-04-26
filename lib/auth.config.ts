import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import type { Role } from "@prisma/client";

const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: String(profile.id),
          username: profile.login,
          role: "STUDENT" as Role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export default authConfig;
