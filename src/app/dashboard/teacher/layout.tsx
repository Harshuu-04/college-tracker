import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import Link from "next/link";


export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Basic Sidebar for Teacher */}
      <div className="w-64 bg-[#002147] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-serif text-[#e2a856]">Teacher Portal</h2>
          <p className="text-sm mt-1 text-blue-200 truncate">{session.user.name}</p>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <Link href="/dashboard/teacher" className="block px-4 py-3 rounded bg-white/10 text-white font-medium">
            Dashboard
          </Link>
          <Link href="/dashboard/teacher/profile" className="block px-4 py-3 rounded hover:bg-white/5 text-blue-100 font-medium">
            My Profile
          </Link>
        </div>
        <div className="p-4 border-t border-white/10">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-red-500/20 text-red-300 font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </Link>
        </div>
      </div>
      
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
