"use server";

import { prisma } from "@/lib/prisma";
import { fetchOrgRepos, fetchReadme, repoExists } from "@/lib/github";

export type AssignmentWithStatus = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  githubRepoId: string;
  status: "not_started" | "in_progress";
  htmlUrl: string;
};

/**
 * Fetch all assignments for the org. Caches metadata in AssignmentCache.
 * Checks if the student already has a fork/copy of each repo.
 */
export async function getAssignmentsForStudent(username: string): Promise<AssignmentWithStatus[]> {
  const org = process.env.GITHUB_ORG!;
  const repos = await fetchOrgRepos();

  const results: AssignmentWithStatus[] = [];

  for (const repo of repos) {
    const slug = repo.name;

    // Upsert cache
    const cached = await prisma.assignmentCache.upsert({
      where: { githubRepoId: String(repo.id) },
      update: { title: repo.name, updatedAt: new Date() },
      create: {
        githubRepoId: String(repo.id),
        slug,
        title: repo.name,
        description: repo.description,
      },
    });

    // Check student repo: GitHub Classroom creates repos like `assignment-name-username`
    const studentRepo = `${slug}-${username}`;
    const exists = await repoExists(org, studentRepo);

    results.push({
      id: cached.id,
      slug: cached.slug,
      title: cached.title,
      description: cached.description,
      deadline: cached.deadline,
      githubRepoId: cached.githubRepoId,
      status: exists ? "in_progress" : "not_started",
      htmlUrl: `https://github.com/${org}/${studentRepo}`,
    });
  }

  return results;
}

/**
 * Get a single assignment with its README content.
 */
export async function getAssignmentBySlug(slug: string, username?: string | null): Promise<{
  assignment: AssignmentWithStatus | null;
  readme: string | null;
}> {
  const org = process.env.GITHUB_ORG!;

  const cached = await prisma.assignmentCache.findUnique({ where: { slug } });
  if (!cached) return { assignment: null, readme: null };

  const readme = await fetchReadme(org, slug);

  // Update description cache if readme changed
  if (readme && readme !== cached.description) {
    await prisma.assignmentCache.update({
      where: { slug },
      data: { description: readme },
    });
  }

  let status: AssignmentWithStatus["status"] = "not_started";
  let htmlUrl = `https://github.com/${org}/${slug}`;

  if (username) {
    const studentRepo = `${slug}-${username}`;
    const exists = await repoExists(org, studentRepo);
    if (exists) {
      status = "in_progress";
      htmlUrl = `https://github.com/${org}/${studentRepo}`;
    }
  }

  return {
    assignment: {
      id: cached.id,
      slug: cached.slug,
      title: cached.title,
      description: cached.description,
      deadline: cached.deadline,
      githubRepoId: cached.githubRepoId,
      status,
      htmlUrl,
    },
    readme,
  };
}
