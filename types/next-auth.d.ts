import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    username: string | null;
    githubId: string | null;
  }
}
