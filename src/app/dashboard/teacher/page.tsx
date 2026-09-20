"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

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

type Submission = {
  id: string;
  status: "SUBMITTED" | "NOT_SUBMITTED";
  student: { rollNo: string; user: { name: string } };
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  subject: { name: string };
  submissions: Submission[];
};

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  const [examType, setExamType] = useState<"MID_SEM" | "END_SEM">("MID_SEM");
  const [maxScore, setMaxScore] = useState("100");
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksMessage, setMarksMessage] = useState("");

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

  const fetchAssignments = () => {
    fetch("/api/teacher/assignments")
      .then((res) => res.json())
      .then(setAssignments);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

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

  const handleCreateAssignment = async () => {
    if (!selectedSubject || !newTitle || !newDueDate) return;
    setCreatingAssignment(true);
    await fetch("/api/teacher/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        dueDate: newDueDate,
        subjectId: selectedSubject,
      }),
    });
    setNewTitle("");
    setNewDueDate("");
    setCreatingAssignment(false);
    fetchAssignments();
  };

  const toggleSubmission = async (submissionId: string, current: string) => {
    const newStatus = current === "SUBMITTED" ? "NOT_SUBMITTED" : "SUBMITTED";
    await fetch("/api/teacher/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, status: newStatus }),
    });
    fetchAssignments();
  };

  const handleMarksChange = (studentId: string, value: string) => {
    setMarksMap((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSaveMarks = async () => {
    setSavingMarks(true);
    setMarksMessage("");
    const res = await fetch("/api/teacher/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject,
        examType,
        marksMap,
        maxScore,
      }),
    });
    const data = await res.json();
    setSavingMarks(false);
    if (data.success) {
      setMarksMessage(`Saved marks for ${data.count} students.`);
    } else {
      setMarksMessage("Failed to save marks.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <LogoutButton />
      </div>
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

      <hr className="my-8" />

      <h2 className="mb-3 text-xl font-bold">Assignments</h2>

      <div className="mb-6 space-y-2 rounded border border-gray-200 p-4">
        <p className="text-sm text-gray-600">
          Create assignment for:{" "}
          {subjects.find((s) => s.id === selectedSubject)?.name || "select a subject above"}
        </p>
        <input
          type="text"
          placeholder="Assignment title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full rounded border border-gray-300 p-2"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="w-full rounded border border-gray-300 p-2"
        />
        <button
          onClick={handleCreateAssignment}
          disabled={creatingAssignment || !selectedSubject}
          className="w-full rounded bg-green-600 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {creatingAssignment ? "Creating..." : "Create Assignment"}
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((a) => (
          <div key={a.id} className="rounded border border-gray-200 p-4">
            <p className="font-semibold">
              {a.title} — {a.subject.name}
            </p>
            <p className="mb-2 text-sm text-gray-500">
              Due: {new Date(a.dueDate).toLocaleDateString()}
            </p>
            <div className="space-y-1">
              {a.submissions.map((sub) => (
                <label
                  key={sub.id}
                  className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                >
                  <span>
                    {sub.student.rollNo} — {sub.student.user.name}
                  </span>
                  <input
                    type="checkbox"
                    checked={sub.status === "SUBMITTED"}
                    onChange={() => toggleSubmission(sub.id, sub.status)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <hr className="my-8" />

      <h2 className="mb-3 text-xl font-bold">Enter Marks</h2>

      {students.length > 0 ? (
        <div className="space-y-3 rounded border border-gray-200 p-4">
          <div className="flex gap-3">
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value as "MID_SEM" | "END_SEM")}
              className="rounded border border-gray-300 p-2"
            >
              <option value="MID_SEM">Mid Sem</option>
              <option value="END_SEM">End Sem</option>
            </select>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="Max score"
              className="w-28 rounded border border-gray-300 p-2"
            />
          </div>

          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between gap-3">
              <span className="text-sm">
                {student.rollNo} — {student.user.name}
              </span>
              <input
                type="number"
                value={marksMap[student.id] || ""}
                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                placeholder="Score"
                className="w-24 rounded border border-gray-300 p-1 text-sm"
              />
            </div>
          ))}

          <button
            onClick={handleSaveMarks}
            disabled={savingMarks}
            className="w-full rounded bg-purple-600 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {savingMarks ? "Saving..." : "Save Marks"}
          </button>

          {marksMessage && <p className="text-sm text-green-600">{marksMessage}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Select a subject above to enter marks.</p>
      )}
    </div>
  );
}