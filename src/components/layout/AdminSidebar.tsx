"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminSidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-white font-serif font-bold text-lg">
            M
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-slate-900">
            Admin Portal
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard/admin"
            className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-soft ${
              isActive("/dashboard/admin") && !isActive("/dashboard/admin/drives") && !isActive("/dashboard/admin/students")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/admin/drives"
            className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-soft ${
              isActive("/dashboard/admin/drives")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Drive Management
          </Link>
          <Link
            href="/dashboard/admin/classes"
            className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-soft ${
              isActive("/dashboard/admin/classes")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Classes
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 px-3 text-sm text-slate-600">
          <div className="font-medium text-slate-900 truncate">
            {session?.user?.name || "Admin User"}
          </div>
          <div className="truncate text-xs">{session?.user?.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-soft hover:bg-slate-50 hover:text-slate-900 card-shadow hover:-translate-y-[1px]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
