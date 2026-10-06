"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import NavbarClient from "@/components/layout/NavbarClient";

type Role = "STUDENT" | "TEACHER" | "ADMIN" | null;
type Mode = "SIGNIN" | "SIGNUP";

type ClassOption = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

export default function AuthPage() {
  const router = useRouter();
  
  const [role, setRole] = useState<Role>(null);
  const [mode, setMode] = useState<Mode>("SIGNIN");
  
  const [classes, setClasses] = useState<ClassOption[]>([]);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [classId, setClassId] = useState("");
  const [teacherRole, setTeacherRole] = useState("FACULTY_COORDINATOR");
  const [teacherClassId, setTeacherClassId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, rollNo, classId, accessCode, teacherRole, teacherClassId }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      // Auto sign in after sign up
      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (!role) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <NavbarClient session={null} />
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl text-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-[#002147] font-serif">Welcome to MSIT Placement Portal</h1>
              <p className="mt-3 text-lg text-slate-600">Please select your role to continue</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <button onClick={() => setRole("STUDENT")} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-[#002147] hover:shadow-md transition-all group">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Student</h3>
              </button>
              
              <button onClick={() => setRole("TEACHER")} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-[#002147] hover:shadow-md transition-all group">
                <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Teacher</h3>
              </button>
              
              <button onClick={() => setRole("ADMIN")} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-[#002147] hover:shadow-md transition-all group">
                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Admin</h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleLabels = {
    STUDENT: "Student",
    TEACHER: "Teacher",
    ADMIN: "Administrator",
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <NavbarClient session={null} />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 sm:p-10 shadow-sm border border-gray-200 relative">
          
          <button 
            onClick={() => { setRole(null); setError(""); }}
            className="absolute top-6 left-6 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="text-center pt-4">
            <h1 className="text-3xl font-bold text-[#002147] font-serif">{roleLabels[role]} Portal</h1>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "SIGNIN" ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          <form onSubmit={mode === "SIGNIN" ? handleSignIn : handleSignUp} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {mode === "SIGNUP" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm"
              />
            </div>

            {mode === "SIGNUP" && role === "STUDENT" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    disabled={isLoading}
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    required
                    disabled={isLoading || classes.length === 0}
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm bg-white"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.batch ? `(Batch ${c.batch})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

                        {mode === "SIGNUP" && role === "TEACHER" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Committee Role</label>
                  <select
                    value={teacherRole}
                    onChange={(e) => setTeacherRole(e.target.value)}
                    required
                    disabled={isLoading}
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm bg-white"
                  >
                    <option value="FACULTY_COORDINATOR">Class Faculty Coordinator</option>
                    <option value="CONVENER">Convener</option>
                    <option value="CO_CONVENER">Co-Convener</option>
                  </select>
                </div>
                {teacherRole === "FACULTY_COORDINATOR" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class Assignment</label>
                    <select
                      value={teacherClassId}
                      onChange={(e) => setTeacherClassId(e.target.value)}
                      required
                      disabled={isLoading || classes.length === 0}
                      className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm bg-white"
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.batch ? `(Batch ${c.batch})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Access Code</label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter teacher registration code"
                    className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hint: Try MSIT-TEACHER-2026</p>
                </div>
              </>
            )}

            {mode === "SIGNUP" && role === "ADMIN" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Access Code</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Enter admin registration code"
                  className="block w-full rounded-md border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-[#002147] focus:ring-[#002147] sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Hint: Try MSIT-ADMIN-2026</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full justify-center rounded-md bg-[#002147] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#001530] focus:outline-none focus:ring-2 focus:ring-[#002147] focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? "Processing..." : (mode === "SIGNIN" ? "Sign In" : "Register")}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            {mode === "SIGNIN" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => { setMode(mode === "SIGNIN" ? "SIGNUP" : "SIGNIN"); setError(""); }}
              className="font-semibold text-[#e2a856] hover:text-[#c79143] transition-colors"
            >
              {mode === "SIGNIN" ? "Register here" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
