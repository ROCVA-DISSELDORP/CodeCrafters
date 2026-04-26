"use server";

import { prisma } from "@/lib/prisma";
import { repoExists } from "@/lib/github";

export type StudentWithProgress = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  assignments: {
    slug: string;
    title: string;
    repoExists: boolean;
    prUrl: string;
  }[];
};

export async function getStudentsWithProgress(): Promise<StudentWithProgress[]> {
  const org = process.env.GITHUB_ORG!;

  const [students, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, username: true, image: true },
    }),
    prisma.assignmentCache.findMany({
      select: { slug: true, title: true },
    }),
  ]);

  const results: StudentWithProgress[] = [];

  for (const student of students) {
    if (!student.username) {
      results.push({ ...student, assignments: [] });
      continue;
    }

    const assignmentProgress = await Promise.all(
      assignments.map(async (a: { slug: string; title: string }) => {
        const studentRepo = `${a.slug}-${student.username}`;
        const exists = await repoExists(org, studentRepo);
        return {
          slug: a.slug,
          title: a.title,
          repoExists: exists,
          prUrl: `https://github.com/${org}/${studentRepo}/pulls`,
        };
      })
    );

    results.push({ ...student, assignments: assignmentProgress });
  }

  return results;
}
