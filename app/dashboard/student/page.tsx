import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssignmentsForStudent } from "@/app/actions/assignments";
import DashboardNav from "@/components/dashboard-nav";
import Link from "next/link";
import { Clock, GitBranch, ChevronRight } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const username = session.user.username ?? "";
  const assignments = await getAssignmentsForStudent(username);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardNav username={username} role={session.user.role} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">Jouw opdrachten</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {assignments.length} opdracht{assignments.length !== 1 ? "en" : ""} beschikbaar
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            Geen opdrachten gevonden voor deze organisatie.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assignments.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/student/assignment/${a.slug}`}
                className="group block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={a.status} />
                    </div>
                    <h2 className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors">
                      {a.title}
                    </h2>
                    {a.description && (
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{a.description}</p>
                    )}
                    {a.deadline && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {new Date(a.deadline).toLocaleDateString("nl-NL")}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 mt-1 shrink-0 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "not_started" | "in_progress" }) {
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <GitBranch className="w-3 h-3" />
        In uitvoering
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
      Nog niet gestart
    </span>
  );
}
