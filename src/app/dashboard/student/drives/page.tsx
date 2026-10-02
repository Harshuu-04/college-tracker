"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import FileUpload from "@/components/FileUpload";

type Project = {
  title: string;
  description: string;
  link: string;
};

type PlacementData = {
  status: "NOT_PLACED" | "PLACED" | "INTERN";
  company: string | null;
  role: string | null;
  packageLPA: number | null;
  offerLetterUrl: string | null;
};

type StudentProfile = {
  id: string;
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
  placement: PlacementData | null;
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [cgpa, setCgpa] = useState("");
  const [techStack, setTechStack] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [gfgUrl, setGfgUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  const [placementStatus, setPlacementStatus] = useState<"NOT_PLACED" | "PLACED" | "INTERN">("NOT_PLACED");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [packageLPA, setPackageLPA] = useState("");
  const [offerLetterUrl, setOfferLetterUrl] = useState("");
  const [savingPlacement, setSavingPlacement] = useState(false);
  const [placementMessage, setPlacementMessage] = useState("");

  useEffect(() => {
    fetch("/api/student/profile")
      .then((res) => res.json())
      .then((data: StudentProfile) => {
        if (data.placement) {
          setPlacementStatus(data.placement.status);
          setCompany(data.placement.company || "");
          setRole(data.placement.role || "");
          setPackageLPA(data.placement.packageLPA?.toString() || "");
          setOfferLetterUrl(data.placement.offerLetterUrl || "");
        }
        setProfile(data);
        setCgpa(data.cgpa?.toString() || "");
        setTechStack(data.techStack || "");
        setResumeUrl(data.resumeUrl || "");
        setProfilePicUrl(data.profilePicUrl || "");
        setTargetRole(data.targetRole || "");
        setTargetDomain(data.targetDomain || "");
        setGithubUrl(data.githubUrl || "");
        setLeetcodeUrl(data.leetcodeUrl || "");
        setGfgUrl(data.gfgUrl || "");
        setLinkedinUrl(data.linkedinUrl || "");
        try {
          setProjects(data.projects ? JSON.parse(data.projects) : []);
        } catch {
          setProjects([]);
        }
        setLoading(false);
      });
  }, []);

  const addProject = () => {
    setProjects([...projects, { title: "", description: "", link: "" }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSavePlacement = async () => {
    if ((placementStatus === "PLACED" || placementStatus === "INTERN") && !offerLetterUrl) {
      setPlacementMessage("Please upload your offer letter before saving.");
      return;
    }
    setSavingPlacement(true);
    setPlacementMessage("");
    const res = await fetch("/api/student/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: placementStatus,
        company,
        role,
        packageLPA,
        offerLetterUrl,
      }),
    });
    setSavingPlacement(false);
    if (res.ok) {
      setPlacementMessage("Placement status updated!");
    } else {
      const data = await res.json().catch(() => ({}));
      setPlacementMessage(data.error || "Failed to update.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cgpa,
        techStack,
        resumeUrl,
        profilePicUrl,
        targetRole,
        targetDomain,
        githubUrl,
        leetcodeUrl,
        gfgUrl,
        linkedinUrl,
        projects: JSON.stringify(projects),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Profile saved!");
    } else {
      setMessage("Failed to save.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!profile) return <div className="p-8">Failed to load profile.</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student/drives" className="text-sm text-blue-600 hover:underline">
            Placement Drives
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter roll number to view a profile"
          id="rollNoSearch"
          className="flex-1 rounded border border-gray-300 bg-white p-2 text-gray-900"
        />
        <button
          onClick={() => {
            const input = document.getElementById("rollNoSearch") as HTMLInputElement;
            if (input.value) window.location.href = `/profile/${input.value}`;
          }}
          className="rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          View
        </button>
      </div>

      <div className="mb-6 rounded border border-gray-200 p-4">
        <p className="font-semibold">
          {profile.rollNo} — {profile.user.name}
        </p>
        <p className="text-sm text-gray-500">{profile.class.name}</p>
        <p className="text-sm text-gray-500">{profile.user.email}</p>
      </div>

      <div className="space-y-4">
        <FileUpload
          label="Profile Picture"
          type="profilePic"
          accept="image/*"
          currentUrl={profilePicUrl}
          onUploaded={setProfilePicUrl}
        />

        <FileUpload
          label="Resume (PDF)"
          type="resume"
          accept="application/pdf"
          currentUrl={resumeUrl}
          onUploaded={setResumeUrl}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">CGPA</label>
          <input
            type="number"
            step="0.01"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tech Stack (comma-separated)
          </label>
          <input
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="React, Node.js, Python"
            className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="SDE"
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Domain</label>
            <input
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              placeholder="Backend"
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">LeetCode</label>
            <input
              type="url"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GeeksforGeeks</label>
            <input
              type="url"
              value={gfgUrl}
              onChange={(e) => setGfgUrl(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Projects</label>
            <button
              onClick={addProject}
              type="button"
              className="rounded bg-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-300"
            >
              + Add Project
            </button>
          </div>
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={index} className="space-y-2 rounded border border-gray-200 p-3">
                <input
                  type="text"
                  placeholder="Project title"
                  value={project.title}
                  onChange={(e) => updateProject(index, "title", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900"
                />
                <textarea
                  placeholder="Description"
                  value={project.description}
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="Link (GitHub/live demo)"
                  value={project.link}
                  onChange={(e) => updateProject(index, "link", e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900"
                />
                <button
                  onClick={() => removeProject(index)}
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {message && <p className="text-sm text-green-600">{message}</p>}

        <hr className="my-8" />

        <h2 className="mb-3 text-xl font-bold">Placement Status</h2>

        <div className="space-y-3 rounded border border-gray-200 p-4">
          <select
            value={placementStatus}
            onChange={(e) => setPlacementStatus(e.target.value as "NOT_PLACED" | "PLACED" | "INTERN")}
            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
          >
            <option value="NOT_PLACED">Not Placed</option>
            <option value="INTERN">Intern</option>
            <option value="PLACED">Placed</option>
          </select>

          {(placementStatus === "PLACED" || placementStatus === "INTERN") && (
            <>
              <input
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
              />
              <input
                type="text"
                placeholder="Role (e.g. SDE Intern)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Package (LPA)"
                value={packageLPA}
                onChange={(e) => setPackageLPA(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
              />
              <FileUpload
                label="Offer Letter (proof)"
                type="offerLetter"
                accept="application/pdf,image/*"
                currentUrl={offerLetterUrl}
                onUploaded={setOfferLetterUrl}
              />
            </>
          )}

          <button
            onClick={handleSavePlacement}
            disabled={
              savingPlacement ||
              ((placementStatus === "PLACED" || placementStatus === "INTERN") && !offerLetterUrl)
            }
            className="w-full rounded bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingPlacement ? "Saving..." : "Update Placement Status"}
          </button>

          {placementMessage && <p className="text-sm text-green-600">{placementMessage}</p>}
        </div>
      </div>
    </div>
  );
}