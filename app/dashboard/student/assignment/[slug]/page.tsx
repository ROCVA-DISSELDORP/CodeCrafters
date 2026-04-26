import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAssignmentBySlug } from "@/app/actions/assignments";
import DashboardNav from "@/components/dashboard-nav";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const { assignment, readme } = await getAssignmentBySlug(slug, session.user.username);

  if (!assignment) notFound();
  const username = session.user.username;
  const githubButtonLabel =
    assignment.status === "in_progress" ? "Open jouw repo" : "Open opdracht-repo";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardNav username={username ?? null} role={session.user.role} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar overzicht
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">{assignment.title}</h1>
            {assignment.deadline && (
              <p className="text-sm text-zinc-500 mt-1">
                Deadline: {new Date(assignment.deadline).toLocaleDateString("nl-NL")}
              </p>
            )}
          </div>
          <a href={assignment.htmlUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 shrink-0">
              <ExternalLink className="w-4 h-4" />
              {githubButtonLabel}
            </Button>
          </a>
        </div>

        {/* README */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          {readme ? (
            <MarkdownRenderer content={readme} />
          ) : (
            <p className="text-zinc-500 text-sm">Geen README gevonden voor deze opdracht.</p>
          )}
        </div>
      </main>
    </div>
  );
}
