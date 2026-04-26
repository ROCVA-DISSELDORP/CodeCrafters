import { signOut } from "@/lib/auth";
import { Code2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNav({
  username,
  role,
}: {
  username: string | null;
  role: string;
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Code2 className="w-5 h-5 text-indigo-400" />
        <span className="font-semibold text-zinc-100 tracking-tight">CodeCraft</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
          {role.toLowerCase()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {username && (
          <span className="text-sm text-zinc-400">@{username}</span>
        )}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="ghost" size="icon-sm">
            <LogOut className="w-4 h-4 text-zinc-400" />
          </Button>
        </form>
      </div>
    </header>
  );
}
