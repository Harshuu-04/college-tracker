"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function NavbarClient({ session }: { session: any }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="MSIT Logo" className="h-10 w-auto" />
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
              MSIT Placements
            </span>
          </Link>
          
          {session?.user?.role === "STUDENT" && (
            <nav className="hidden md:flex gap-1">
              <Link
                href="/dashboard/student"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-soft ${
                  isActive("/dashboard/student") && !isActive("/dashboard/student/drives")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/student/drives"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-soft ${
                  isActive("/dashboard/student/drives")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Drives
              </Link>
              <Link
                href="/dashboard/student/directory"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-soft ${
                  isActive("/dashboard/student/directory")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Directory
              </Link>
              <Link
                href={`/profile/${session.user.rollNumber || session.user.id}`}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-soft ${
                  isActive("/profile")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                My Profile
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-soft hover:bg-slate-50 hover:text-slate-900 card-shadow hover:-translate-y-[1px] hover:shadow-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-soft hover:text-slate-900 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-soft hover:bg-slate-800 hover:shadow-md hover:-translate-y-[1px]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
