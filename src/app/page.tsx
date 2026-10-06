import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { auth } from "@/../auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // Redirect logged-in users to their respective dashboards
  if (session) {
    if (session.user.role === "STUDENT") {
      redirect("/dashboard/student");
    } else if (session.user.role === "ADMIN") {
      redirect("/dashboard/admin");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-8">
          <div className="mx-auto flex justify-center mb-6">
            <img src="/logo.jpg" alt="MSIT Logo" className="h-24 w-auto drop-shadow-md" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-slate-900 leading-tight">
            MSIT Training & Placement
            <span className="block text-amber-500 mt-2">Management System</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The official portal for MSIT students to manage their profiles, 
            explore placement drives, and track their recruitment journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-md bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-soft hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg"
            >
              Register as Student
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-md border-2 border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-soft hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
