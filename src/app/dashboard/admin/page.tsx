"use client";

import { useEffect, useState } from "react";

type ClassData = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

type StudentWithPlacement = {
  id: string;
  rollNo: string;
  user: { name: string };
  classId: string;
  class: { name: string };
  placement: {
    status: "NOT_PLACED" | "PLACED" | "INTERN";
    company: string | null;
    role: string | null;
  } | null;
};

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentWithPlacement[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [editing, setEditing] = useState<Record<string, { status: string; company: string; role: string; classId: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch("/api/admin/placement"),
        fetch("/api/classes")
      ]);
      
      const studentsData = await studentsRes.json();
      const classesData = await classesRes.json();
      
      setStudents(studentsData);
      setClasses(classesData);
      
      const initial: Record<string, { status: string; company: string; role: string; classId: string }> = {};
      studentsData.forEach((s: StudentWithPlacement) => {
        initial[s.id] = {
          status: s.placement?.status || "NOT_PLACED",
          company: s.placement?.company || "",
          role: s.placement?.role || "",
          classId: s.classId,
        };
      });
      setEditing(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
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
        classId: data.classId,
      }),
    });
    setSaving(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Placement Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage student placement records</p>
        </div>
        <div className="h-96 w-full animate-pulse rounded-xl bg-slate-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Placement Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track student placement records
        </p>
      </div>

      <div className="rounded-xl card-shadow overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Company & Role
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.map((student) => {
                const isPlaced = editing[student.id]?.status === "PLACED" || editing[student.id]?.status === "INTERN";
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-soft">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{student.user.name}</span>
                        <span className="text-sm text-slate-500">{student.rollNo}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        value={editing[student.id]?.classId || ""}
                        onChange={(e) => updateField(student.id, "classId", e.target.value)}
                        className="rounded-md border-slate-300 bg-slate-50 text-sm focus:border-amber-500 focus:ring-amber-500 text-slate-700"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        value={editing[student.id]?.status || "NOT_PLACED"}
                        onChange={(e) => updateField(student.id, "status", e.target.value)}
                        className={`rounded-md border-slate-300 text-sm focus:border-amber-500 focus:ring-amber-500 ${
                          editing[student.id]?.status === "NOT_PLACED" ? "bg-slate-50 text-slate-600" :
                          editing[student.id]?.status === "INTERN" ? "bg-blue-50 text-blue-700 font-medium border-blue-200" :
                          "bg-green-50 text-green-700 font-medium border-green-200"
                        }`}
                      >
                        <option value="NOT_PLACED">Not Placed</option>
                        <option value="INTERN">Intern</option>
                        <option value="PLACED">Placed</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Company"
                          disabled={!isPlaced}
                          value={editing[student.id]?.company || ""}
                          onChange={(e) => updateField(student.id, "company", e.target.value)}
                          className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:bg-slate-50 disabled:opacity-50"
                        />
                        <input
                          type="text"
                          placeholder="Role"
                          disabled={!isPlaced}
                          value={editing[student.id]?.role || ""}
                          onChange={(e) => updateField(student.id, "role", e.target.value)}
                          className="w-40 rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:bg-slate-50 disabled:opacity-50"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => handleSave(student.id)}
                        disabled={saving === student.id}
                        className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-soft disabled:opacity-50"
                      >
                        {saving === student.id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No student records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
