"use client";

import { useEffect, useState } from "react";

type Subject = {
  id: string;
  name: string;
  class: { id: string; name: string };
};

type Student = {
  id: string;
  rollNo: string;
  user: { name: string };
};

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/teacher/subjects")
      .then((res) => res.json())
      .then(setSubjects);
  }, []);

  useEffect(() => {
    if (!selectedSubject) {
      setStudents([]);
      return;
    }
    fetch(`/api/teacher/students?subjectId=${selectedSubject}`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        const initial: Record<string, "PRESENT" | "ABSENT"> = {};
        data.forEach((s: Student) => {
          initial[s.id] = "PRESENT";
        });
        setAttendance(initial);
      });
  }, [selectedSubject]);

  const toggleStudent = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject,
        date,
        attendanceMap: attendance,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMessage(`Saved attendance for ${data.count} students.`);
    } else {
      setMessage("Failed to save attendance.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-1 text-2xl font-bold">Teacher Dashboard</h1>
      <p className="mb-6 text-gray-600">Date: {date}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Select Class / Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 p-2"
        >
          <option value="">-- Choose --</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.class.name} — {s.name}
            </option>
          ))}
        </select>
      </div>

      {students.length > 0 && (
        <div className="mb-6 space-y-2">
          <h2 className="font-semibold text-gray-800">Students</h2>
          {students.map((student) => (
            <label
              key={student.id}
              className="flex items-center justify-between rounded border border-gray-200 p-3"
            >
              <span>
                {student.rollNo} — {student.user.name}
              </span>
              <input
                type="checkbox"
                checked={attendance[student.id] === "PRESENT"}
                onChange={() => toggleStudent(student.id)}
                className="h-5 w-5"
              />
            </label>
          ))}
        </div>
      )}

      {students.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      )}

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}