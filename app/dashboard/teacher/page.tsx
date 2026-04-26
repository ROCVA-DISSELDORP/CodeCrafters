import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudentsWithProgress } from "@/app/actions/users";
import DashboardNav from "@/components/dashboard-nav";
import { GitBranch, GitPullRequest, User } from "lucide-react";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard/student");

  const students = await getStudentsWithProgress();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardNav username={session.user.username ?? null} role={session.user.role} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">Studentenoverzicht</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {students.length} student{students.length !== 1 ? "en" : ""} geregistreerd
          </p>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            Nog geen studenten gevonden.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                {/* Student header */}
                <div className="flex items-center gap-3 mb-4">
                  {student.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.image}
                      alt={student.name ?? ""}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-zinc-100 text-sm">{student.name ?? "Onbekend"}</p>
                    {student.username && (
                      <p className="text-xs text-zinc-500">@{student.username}</p>
                    )}
                  </div>
                </div>

                {/* Assignments */}
                {student.assignments.length === 0 ? (
                  <p className="text-xs text-zinc-600">Geen opdrachten.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {student.assignments.map((a) => (
                      <div
                        key={a.slug}
                        className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {a.repoExists ? (
                            <GitBranch className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            </span>
                          )}
                          <span className="text-xs text-zinc-400 truncate">{a.title}</span>
                        </div>
                        {a.repoExists && (
                          <a
                            href={a.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 shrink-0 text-zinc-500 hover:text-indigo-400 transition-colors"
                            title="Pull Requests bekijken"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
