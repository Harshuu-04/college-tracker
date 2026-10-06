"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import NavbarClient from "@/components/layout/NavbarClient";

type Project = {
  title: string;
  description: string;
  link: string;
};

type StudentProfile = {
  rollNo: string;
  user: { name: string; email: string };
  class: { name: string };
  cgpa: number | null;
  techStack: string | null;
  resumeUrl: string | null;
  profilePicUrl: string | null;
  targetRole: string | null;
  targetDomain: string | null;
  githubUrl: string | null;
  leetcodeUrl: string | null;
  gfgUrl: string | null;
  linkedinUrl: string | null;
  projects: string | null;
  placement: {
    status: "NOT_PLACED" | "PLACED" | "INTERN";
    company: string | null;
    role: string | null;
  } | null;
};

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const rollNo = params.rollNo as string;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/profile/${rollNo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setProfile(data);
        }
        setLoading(false);
      });
  }, [rollNo]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <NavbarClient session={null} />
        <div className="mx-auto w-full max-w-4xl p-8 space-y-6 animate-pulse mt-8">
          <div className="h-40 w-full bg-slate-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 h-64 bg-slate-200 rounded-xl"></div>
            <div className="md:col-span-2 h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <NavbarClient session={null} />
        <div className="mx-auto w-full max-w-2xl p-8 mt-12 text-center">
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 card-shadow">
            <h2 className="text-xl text-slate-900 mb-2">Profile Not Found</h2>
            <p className="text-slate-500 mb-6">Could not find a student with roll number {rollNo}.</p>
            <button onClick={() => router.back()} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-soft">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  let projects: Project[] = [];
  try {
    projects = profile.projects ? JSON.parse(profile.projects) : [];
  } catch {
    projects = [];
  }

  const isPlaced = profile.placement?.status === "PLACED" || profile.placement?.status === "INTERN";

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <NavbarClient session={null} />
      
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 mt-4">
        <button 
          onClick={() => router.back()}
          className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-soft"
        >
          <svg className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header Profile Card */}
        <div className="rounded-xl bg-white card-shadow overflow-hidden">
          <div className="h-32 w-full bg-slate-900"></div>
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-6 -mt-12 sm:-mt-16">
                {profile.profilePicUrl ? (
                  <img
                    src={profile.profilePicUrl}
                    alt={profile.user.name}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-md text-slate-400">
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
                
                <div className="pb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{profile.user.name}</h1>
                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {profile.class.name} • {profile.rollNo}
                  </p>
                </div>
              </div>

              <div className="pb-2">
                {isPlaced ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {profile.placement?.status === "INTERN" ? "Interning at " : "Placed at "}
                    <span className="font-bold">{profile.placement?.company}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600">
                    Open to Opportunities
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Details & Links */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Quick Stats */}
            <div className="rounded-xl bg-white card-shadow p-6">
              <h2 className="text-lg font-semibold border-b border-slate-100 pb-3 mb-4">Academic Info</h2>
              <div className="space-y-4">
                {profile.cgpa && (
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">CGPA</span>
                    <span className="text-lg font-medium text-slate-900">{profile.cgpa}</span>
                  </div>
                )}
                {profile.targetRole && (
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Target Role</span>
                    <span className="text-sm font-medium text-slate-900">{profile.targetRole}</span>
                  </div>
                )}
                {profile.targetDomain && (
                  <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Target Domain</span>
                    <span className="text-sm font-medium text-slate-900">{profile.targetDomain}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-xl bg-white card-shadow p-6">
              <h2 className="text-lg font-semibold border-b border-slate-100 pb-3 mb-4">Profiles & Links</h2>
              <div className="flex flex-col gap-3">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 hover:border-slate-300 transition-soft">
                    <svg className="w-5 h-5 text-slate-700 group-hover:text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">GitHub</span>
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 hover:border-blue-300 transition-soft">
                    <svg className="w-5 h-5 text-[#0A66C2] group-hover:text-[#004182]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">LinkedIn</span>
                  </a>
                )}
                {profile.leetcodeUrl && (
                  <a href={profile.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 hover:border-amber-300 transition-soft">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FFA116] text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">LeetCode</span>
                  </a>
                )}
                {profile.gfgUrl && (
                  <a href={profile.gfgUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 hover:border-green-300 transition-soft">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#2F8D46] text-white font-bold text-[10px]">
                      GfG
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">GeeksforGeeks</span>
                  </a>
                )}
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-slate-900 bg-slate-900 p-3 hover:bg-slate-800 transition-soft shadow-sm mt-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-white">View Resume</span>
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Main Content */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Tech Stack */}
            {profile.techStack && (
              <div className="rounded-xl bg-white card-shadow p-6">
                <h2 className="text-lg font-semibold border-b border-slate-100 pb-3 mb-4">Tech Stack & Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.techStack.split(",").map((tech, i) => {
                    const t = tech.trim();
                    if (!t) return null;
                    return (
                      <span key={i} className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800">
                        {t}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects */}
            <div className="rounded-xl bg-white card-shadow p-6">
              <h2 className="text-lg font-semibold border-b border-slate-100 pb-3 mb-4">Projects</h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No projects added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-5 hover:border-slate-300 hover:bg-slate-50 transition-soft group relative">
                      <h3 className="font-semibold text-slate-900 text-lg mb-2">{project.title}</h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
                        >
                          View Project
                          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
