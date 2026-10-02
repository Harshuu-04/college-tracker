"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
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

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const addRound = () => setRoundNames([...roundNames, ""]);
  const updateRound = (index: number, value: string) => {
    const updated = [...roundNames];
    updated[index] = value;
    setRoundNames(updated);
  };
  const removeRound = (index: number) => {
    setRoundNames(roundNames.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setCreating(true);
    setMessage("");

    const res = await fetch("/api/admin/drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        role,
        type,
        packageLPA,
        description,
        driveDate,
        registrationDeadline,
        minCgpa,
        maxBacklogs,
        classIds: selectedClassIds,
        roundNames: roundNames.filter((r) => r.trim() !== ""),
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Drive created successfully!");
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
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Drives</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="text-sm text-blue-600 hover:underline">
            ← Back to placements
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-8 space-y-3 rounded border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800">Create New Drive</h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "FULL_TIME" | "INTERNSHIP")}
            className="rounded border border-gray-300 bg-white p-2 text-gray-900"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          <input
            type="number"
            step="0.1"
            placeholder="Package (LPA)"
            value={packageLPA}
            onChange={(e) => setPackageLPA(e.target.value)}
            className="rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
          <input
            type="date"
            placeholder="Drive date"
            value={driveDate}
            onChange={(e) => setDriveDate(e.target.value)}
            className="rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
        </div>

        <textarea
          placeholder="Job description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Min CGPA (eligibility)
            </label>
            <input
              type="number"
              step="0.1"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Backlogs (eligibility)
            </label>
            <input
              type="number"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Eligible Classes
          </label>
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => (
              <label
                key={c.id}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                  selectedClassIds.includes(c.id)
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedClassIds.includes(c.id)}
                  onChange={() => toggleClass(c.id)}
                  className="mr-1"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Recruitment Rounds</label>
            <button
              onClick={addRound}
              type="button"
              className="rounded bg-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-300"
            >
              + Add Round
            </button>
          </div>
          <div className="space-y-2">
            {roundNames.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={r}
                  onChange={(e) => updateRound(i, e.target.value)}
                  placeholder={`Round ${i + 1} name`}
                  className="flex-1 rounded border border-gray-300 bg-white p-2 text-sm text-gray-900"
                />
                <button
                  onClick={() => removeRound(i)}
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
          onClick={handleCreate}
          disabled={creating}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Drive"}
        </button>

        {message && <p className="text-sm text-green-600">{message}</p>}
      </div>

      <h2 className="mb-3 text-xl font-bold">All Drives</h2>
      <div className="space-y-3">
        {drives.map((drive) => (
          <div key={drive.id} className="rounded border border-gray-200 p-4">
            <p className="font-semibold">
              {drive.companyName} — {drive.role}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({drive.type === "FULL_TIME" ? "Full Time" : "Internship"})
              </span>
            </p>
            <p className="text-sm text-gray-500">
              {drive.packageLPA ? `${drive.packageLPA} LPA — ` : ""}
              Deadline: {new Date(drive.registrationDeadline).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Classes: {drive.eligibleClasses.map((ec) => ec.class.name).join(", ")}
            </p>
            <p className="text-sm text-gray-500">
              Rounds: {drive.rounds.map((r) => r.name).join(" → ")}
            </p>
            <p className="text-sm text-gray-500">
              {drive.registrations.length} student(s) registered
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}