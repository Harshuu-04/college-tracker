"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarClient from "@/components/layout/NavbarClient";

type ClassOption = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

export default function SignupPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [classId, setClassId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, rollNo, classId }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavbarClient session={null} />
      
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl space-y-8 rounded-2xl bg-white p-8 sm:p-10 card-shadow">
          <div className="text-center">
            <h1 className="text-3xl">Student Registration</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create your account to access the MSIT placement portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-soft disabled:opacity-50 disabled:bg-slate-50"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-soft disabled:opacity-50 disabled:bg-slate-50"
                  placeholder="student@msit.in"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-soft disabled:opacity-50 disabled:bg-slate-50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  disabled={loading}
                  className="block w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-soft disabled:opacity-50 disabled:bg-slate-50"
                  placeholder="e.g. 00115002720"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  disabled={loading || classes.length === 0}
                  className="block w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 sm:text-sm transition-soft disabled:opacity-50 disabled:bg-slate-50 bg-white"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.batch ? `(Batch ${c.batch})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Registering...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500 transition-soft">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
