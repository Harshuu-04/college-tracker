"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";
import Link from "next/link";

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
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSavePlacement = async () => {
    setSavingPlacement(true);
    setPlacementMessage("");
    const res = await fetch("/api/student/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: placementStatus,
        company: placementStatus === "NOT_PLACED" ? null : company,
        role: placementStatus === "NOT_PLACED" ? null : role,
        packageLPA: placementStatus === "NOT_PLACED" ? null : parseFloat(packageLPA),
        offerLetterUrl: placementStatus === "NOT_PLACED" ? null : offerLetterUrl,
      }),
    });
    setSavingPlacement(false);
    if (res.ok) {
      setPlacementMessage("Placement status updated!");
      setTimeout(() => setPlacementMessage(""), 3000);
    } else {
      setPlacementMessage("Failed to update.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/student/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cgpa: parseFloat(cgpa),
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
      setMessage("Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to save.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Student Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile, resume, and placement status
          </p>
        </div>
        <Link
          href={`/profile/${profile.rollNo}`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-soft"
        >
          View Public Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Form) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl card-shadow p-6">
            <h2 className="text-xl mb-4 border-b border-slate-100 pb-3">Basic Information</h2>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Profile Picture</label>
                <FileUpload
                  type="profilePic"
                  accept="image/*"
                  currentUrl={profilePicUrl}
                  onUploaded={setProfilePicUrl}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm text-slate-500">Name</label>
                  <div className="font-medium text-slate-900">{profile.user.name}</div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500">Roll Number</label>
                  <div className="font-medium text-slate-900">{profile.rollNo}</div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500">Class</label>
                  <div className="font-medium text-slate-900">{profile.class.name}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="e.g. 8.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SDE"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Domain</label>
                <input
                  type="text"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g. Backend"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="React, Node.js, Python"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Links & Resume */}
          <div className="rounded-xl card-shadow p-6">
            <h2 className="text-xl mb-4 border-b border-slate-100 pb-3">Links & Resume</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Resume (PDF)</label>
              <FileUpload
                type="resume"
                accept="application/pdf"
                currentUrl={resumeUrl}
                onUploaded={setResumeUrl}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LeetCode</label>
                <input
                  type="url"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://leetcode.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GeeksforGeeks</label>
                <input
                  type="url"
                  value={gfgUrl}
                  onChange={(e) => setGfgUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://auth.geeksforgeeks.org/..."
                />
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-xl card-shadow p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl">Projects</h2>
              <button
                onClick={addProject}
                type="button"
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                + Add Project
              </button>
            </div>
            
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  No projects added yet. Add a project to stand out!
                </div>
              ) : (
                projects.map((project, index) => (
                  <div key={index} className="relative space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <button
                      onClick={() => removeProject(index)}
                      type="button"
                      className="absolute right-3 top-3 text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                    <div>
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={project.title}
                        onChange={(e) => updateProject(index, "title", e.target.value)}
                        className="w-full sm:w-3/4 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Short Description"
                        value={project.description}
                        onChange={(e) => updateProject(index, "description", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        placeholder="Link (GitHub/live demo)"
                        value={project.link}
                        onChange={(e) => updateProject(index, "link", e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-4 pb-12">
            {message && <span className="text-sm font-medium text-green-600">{message}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Placement Status Card */}
          <div className="rounded-xl card-shadow p-6 bg-amber-50/50 border-amber-100">
            <h2 className="text-xl mb-4 border-b border-amber-200 pb-3 text-slate-900">Placement Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={placementStatus}
                  onChange={(e) => setPlacementStatus(e.target.value as "NOT_PLACED" | "PLACED" | "INTERN")}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 sm:text-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="NOT_PLACED">Not Placed</option>
                  <option value="INTERN">Intern</option>
                  <option value="PLACED">Placed</option>
                </select>
              </div>

              {(placementStatus === "PLACED" || placementStatus === "INTERN") && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <input
                      type="text"
                      placeholder="e.g. SDE Intern"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Package (LPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 12.5"
                      value={packageLPA}
                      onChange={(e) => setPackageLPA(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Offer Letter Proof</label>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <FileUpload
                        type="offerLetter"
                        accept="application/pdf,image/*"
                        currentUrl={offerLetterUrl}
                        onUploaded={setOfferLetterUrl}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Required for verification. Only visible to admins.</p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleSavePlacement}
                  disabled={
                    savingPlacement ||
                    ((placementStatus === "PLACED" || placementStatus === "INTERN") && !offerLetterUrl)
                  }
                  className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-amber-600 disabled:opacity-50 disabled:bg-slate-300"
                >
                  {savingPlacement ? "Updating..." : "Update Status"}
                </button>
                {placementMessage && (
                  <p className="mt-2 text-center text-sm font-medium text-green-700">{placementMessage}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats / Info */}
          <div className="rounded-xl card-shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Account Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-900 truncate pl-4">{profile.user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Roll No</span>
                <span className="text-slate-900">{profile.rollNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Profile Completion</span>
                <span className="text-amber-600 font-medium">
                  {Math.round(
                    [cgpa, techStack, resumeUrl, profilePicUrl, targetRole, linkedinUrl].filter(Boolean).length / 6 * 100
                  )}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
