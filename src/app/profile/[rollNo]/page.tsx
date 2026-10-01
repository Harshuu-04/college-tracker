"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !profile) return <div className="p-8">Profile not found.</div>;

  let projects: Project[] = [];
  try {
    projects = profile.projects ? JSON.parse(profile.projects) : [];
  } catch {
    projects = [];
  }

  const statusLabel =
    profile.placement?.status === "PLACED"
      ? `Placed at ${profile.placement.company}`
      : profile.placement?.status === "INTERN"
      ? `Interning at ${profile.placement.company}`
      : "Not Placed";

  const statusColor =
    profile.placement?.status === "PLACED"
      ? "bg-green-100 text-green-700"
      : profile.placement?.status === "INTERN"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back
      </Link>

      <div className="mb-6 flex items-center gap-4">
        {profile.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt={profile.user.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gray-200" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{profile.user.name}</h1>
          <p className="text-gray-500">
            {profile.rollNo} — {profile.class.name}
          </p>
          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        {profile.cgpa && (
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs text-gray-500">CGPA</p>
            <p className="font-semibold">{profile.cgpa}</p>
          </div>
        )}
        {profile.targetRole && (
          <div className="rounded border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Target Role</p>
            <p className="font-semibold">{profile.targetRole}</p>
          </div>
        )}
      </div>

      {profile.techStack && (
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-gray-800">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {profile.techStack.split(",").map((tech, i) => (
              <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        {profile.githubUrl && (
          <a href={profile.githubUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
            GitHub
          </a>
        )}
        {profile.linkedinUrl && (
          <a href={profile.linkedinUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
            LinkedIn
          </a>
        )}
        {profile.leetcodeUrl && (
          <a href={profile.leetcodeUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
            LeetCode
          </a>
        )}
        {profile.gfgUrl && (
          <a href={profile.gfgUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
            GeeksforGeeks
          </a>
        )}
        {profile.resumeUrl && (
          <a href={profile.resumeUrl} target="_blank" className="text-sm text-blue-600 hover:underline">
            Resume
          </a>
        )}
      </div>

      {projects.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-gray-800">Projects</h2>
          <div className="space-y-3">
            {projects.map((project, i) => (
              <div key={i} className="rounded border border-gray-200 p-3">
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-gray-600">{project.description}</p>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}