"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type StudentWithPlacement = {
  id: string;
  rollNo: string;
  user: { name: string };
  class: { name: string };
  placement: {
    status: "NOT_PLACED" | "PLACED" | "INTERN";
    company: string | null;
    role: string | null;
  } | null;
};

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentWithPlacement[]>([]);
  const [editing, setEditing] = useState<Record<string, { status: string; company: string; role: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchStudents = () => {
    fetch("/api/admin/placement")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        const initial: Record<string, { status: string; company: string; role: string }> = {};
        data.forEach((s: StudentWithPlacement) => {
          initial[s.id] = {
            status: s.placement?.status || "NOT_PLACED",
            company: s.placement?.company || "",
            role: s.placement?.role || "",
          };
        });
        setEditing(initial);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const updateField = (studentId: string, field: string, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSave = async (studentId: string) => {
    setSaving(studentId);
    const data = editing[studentId];
    await fetch("/api/admin/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        status: data.status,
        company: data.company,
        role: data.role,
      }),
    });
    setSaving(null);
    fetchStudents();
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard — Placement Cell</h1>
        <LogoutButton />
      </div>

      <div className="space-y-4">
        {students.map((student) => (
          <div key={student.id} className="rounded border border-gray-200 p-4">
            <p className="mb-2 font-semibold">
              {student.rollNo} — {student.user.name}{" "}
              <span className="text-sm font-normal text-gray-500">({student.class.name})</span>
            </p>

            <div className="grid grid-cols-3 gap-3">
              <select
                value={editing[student.id]?.status || "NOT_PLACED"}
                onChange={(e) => updateField(student.id, "status", e.target.value)}
                className="rounded border border-gray-300 p-2 text-sm"
              >
                <option value="NOT_PLACED">Not Placed</option>
                <option value="INTERN">Intern</option>
                <option value="PLACED">Placed</option>
              </select>
              <input
                type="text"
                placeholder="Company"
                value={editing[student.id]?.company || ""}
                onChange={(e) => updateField(student.id, "company", e.target.value)}
                className="rounded border border-gray-300 p-2 text-sm"
              />
              <input
                type="text"
                placeholder="Role"
                value={editing[student.id]?.role || ""}
                onChange={(e) => updateField(student.id, "role", e.target.value)}
                className="rounded border border-gray-300 p-2 text-sm"
              />
            </div>

            <button
              onClick={() => handleSave(student.id)}
              disabled={saving === student.id}
              className="mt-3 rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving === student.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}