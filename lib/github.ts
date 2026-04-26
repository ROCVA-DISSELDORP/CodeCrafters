import { Octokit } from "@octokit/rest";

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  return new Octokit({ auth: token });
}

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  updated_at: string | null;
};

/**
 * Fetch all repositories for the configured GitHub Classroom organization.
 */
export async function fetchOrgRepos(): Promise<GitHubRepo[]> {
  const org = process.env.GITHUB_ORG;
  if (!org) throw new Error("GITHUB_ORG env variable is not set");

  const octokit = getOctokit();
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.repos.listForOrg({
      org,
      type: "all",
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    repos.push(
      ...data.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description ?? null,
        html_url: r.html_url,
        updated_at: r.updated_at ?? null,
      }))
    );

    if (data.length < 100) break;
    page++;
  }

  return repos;
}

/**
 * Fetch and decode the README for a repository.
 * Returns null if no README is found.
 */
export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    if ("content" in data && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

/**
 * Check if a specific repository exists (used to determine assignment status for a student).
 */
export async function repoExists(owner: string, repo: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404) return false;
  if (response.ok) return true;

  throw new Error(`GitHub repo lookup failed (${response.status}) for ${owner}/${repo}`);
}
