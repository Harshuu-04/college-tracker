"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClassOption = {
  id: string;
  name: string;
};

type DriveListItem = {
  id: string;
  companyName: string;
  role: string;
  type: string;
  packageLPA: number | null;
  registrationDeadline: string;
  eligibleClasses: { class: { name: string } }[];
  rounds: { id: string; name: string }[];
  registrations: { id: string }[];
};

export default function AdminDrivesPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [drives, setDrives] = useState<DriveListItem[]>([]);

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState<"FULL_TIME" | "INTERNSHIP">("FULL_TIME");
  const [packageLPA, setPackageLPA] = useState("");
  const [description, setDescription] = useState("");
  const [driveDate, setDriveDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [minCgpa, setMinCgpa] = useState("");
  const [maxBacklogs, setMaxBacklogs] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [roundNames, setRoundNames] = useState<string[]>(["Resume Shortlist"]);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchDrives = () => {
    fetch("/api/admin/drives")
      .then((res) => res.json())
      .then(setDrives);
  };

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetchDrives();
  }, []);

  const handleClassToggle = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addRound = () => setRoundNames([...roundNames, ""]);
  const updateRound = (index: number, val: string) => {
    const updated = [...roundNames];
    updated[index] = val;
    setRoundNames(updated);
  };
  const removeRound = (index: number) => {
    setRoundNames(roundNames.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");

    const res = await fetch("/api/admin/drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        role,
        type,
        packageLPA: packageLPA ? parseFloat(packageLPA) : null,
        description,
        driveDate,
        registrationDeadline,
        minCgpa: minCgpa ? parseFloat(minCgpa) : null,
        maxBacklogs: maxBacklogs ? parseInt(maxBacklogs, 10) : null,
        classIds: selectedClassIds,
        rounds: roundNames.filter((r) => r.trim() !== ""),
      }),
    });

    setCreating(false);
    if (res.ok) {
      setMessage("Drive created successfully!");
      setShowCreateForm(false);
      setCompanyName("");
      setRole("");
      setPackageLPA("");
      setDescription("");
      setDriveDate("");
      setRegistrationDeadline("");
      setMinCgpa("");
      setMaxBacklogs("");
      setSelectedClassIds([]);
      setRoundNames(["Resume Shortlist"]);
      fetchDrives();
    } else {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Failed to create drive.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Placement Drives</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage recruitment drives</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-soft"
        >
          {showCreateForm ? "Cancel" : "+ Create New Drive"}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-xl card-shadow p-6 bg-white animate-in slide-in-from-top-4 duration-300">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl">Create New Drive</h2>
            <p className="text-sm text-slate-500">Fill in the details to announce a new placement drive.</p>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "FULL_TIME" | "INTERNSHIP")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Package (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={packageLPA}
                  onChange={(e) => setPackageLPA(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drive Date</label>
                <input
                  type="date"
                  required
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registration Deadline</label>
                <input
                  type="date"
                  required
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min CGPA required (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Active Backlogs (optional)</label>
                <input
                  type="number"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Eligible Classes</label>
              <div className="flex flex-wrap gap-3">
                {classes.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(c.id)}
                      onChange={() => handleClassToggle(c.id)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Recruitment Rounds</label>
                <button
                  type="button"
                  onClick={addRound}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Add Round
                </button>
              </div>
              <div className="space-y-2">
                {roundNames.map((round, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-sm font-medium text-slate-600">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={round}
                      onChange={(e) => updateRound(index, e.target.value)}
                      placeholder="e.g. Online Assessment"
                      className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    {roundNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRound(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-slate-100 gap-4">
              {message && <span className={`text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</span>}
              <button
                type="submit"
                disabled={creating}
                className="rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-amber-600 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Drive"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drives List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {drives.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-12 rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-slate-500">No drives created yet.</p>
          </div>
        ) : (
          drives.map((drive) => (
            <div key={drive.id} className="rounded-xl card-shadow overflow-hidden bg-white">
              <div className="p-5 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{drive.companyName}</h3>
                    <p className="text-sm text-slate-600 font-medium">{drive.role}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 border border-slate-200">
                    {drive.type}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Package</span>
                  <span className="font-medium text-slate-900">{drive.packageLPA ? `${drive.packageLPA} LPA` : "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-medium text-slate-900">{new Date(drive.registrationDeadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registrations</span>
                  <span className="font-medium text-amber-600">{drive.registrations.length} students</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
