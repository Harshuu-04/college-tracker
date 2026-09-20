"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type SubjectStat = {
  subjectId: string;
  subjectName: string;
  totalClasses: number;
  present: number;
  percentage: number;
};

type MarkItem = {
  id: string;
  examType: "MID_SEM" | "END_SEM";
  score: number;
  maxScore: number;
  subject: { name: string };
};

type AttendanceData = {
  overall: { total: number; present: number; percentage: number };
  subjects: SubjectStat[];
};

type SubmissionItem = {
  id: string;
  status: "SUBMITTED" | "NOT_SUBMITTED";
  assignment: {
    title: string;
    dueDate: string;
    subject: { name: string };
  };
};

export default function StudentDashboard() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<SubmissionItem[]>([]);
  const [marks, setMarks] = useState<MarkItem[]>([]);

  useEffect(() => {
    fetch("/api/student/attendance")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });

    fetch("/api/student/marks")
      .then((res) => res.json())
      .then(setMarks);

    fetch("/api/student/assignments")
      .then((res) => res.json())
      .then(setAssignments);
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Failed to load attendance.</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="mb-8 rounded-lg bg-blue-50 p-6 text-center">
        <p className="text-sm text-gray-600">Overall Attendance</p>
        <p className="text-4xl font-bold text-blue-700">{data.overall.percentage}%</p>
        <p className="text-sm text-gray-500">
          {data.overall.present} / {data.overall.total} classes attended
        </p>
      </div>

      <h2 className="mb-3 font-semibold text-gray-800">Subject-wise Breakdown</h2>
      <div className="mb-8 space-y-3">
        {data.subjects.map((s) => (
          <div
            key={s.subjectId}
            className="flex items-center justify-between rounded border border-gray-200 p-4"
          >
            <div>
              <p className="font-medium">{s.subjectName}</p>
              <p className="text-sm text-gray-500">
                {s.present} / {s.totalClasses} classes
              </p>
            </div>
            <p
              className={`text-lg font-bold ${
                s.percentage >= 75 ? "text-green-600" : "text-red-600"
              }`}
            >
              {s.percentage}%
            </p>
          </div>
        ))}
      </div>

      <hr className="my-8" />

      <h2 className="mb-3 text-xl font-bold">My Assignments</h2>
      <div className="space-y-3">
        {assignments.length === 0 && (
          <p className="text-sm text-gray-500">No assignments yet.</p>
        )}
        {assignments.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between rounded border border-gray-200 p-4"
          >
            <div>
              <p className="font-medium">{sub.assignment.title}</p>
              <p className="text-sm text-gray-500">
                {sub.assignment.subject.name} — Due{" "}
                {new Date(sub.assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded px-3 py-1 text-sm font-medium ${
                sub.status === "SUBMITTED"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {sub.status === "SUBMITTED" ? "Submitted" : "Not Submitted"}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-8" />

      <h2 className="mb-3 text-xl font-bold">My Marks</h2>
      <div className="space-y-3">
         {marks.length === 0 && <p className="text-sm text-gray-500">No marks yet.</p>}
         {marks.map((m) => (
    <div
      key={m.id}
      className="flex items-center justify-between rounded border border-gray-200 p-4"
    >
      <div>
        <p className="font-medium">{m.subject.name}</p>
        <p className="text-sm text-gray-500">
          {m.examType === "MID_SEM" ? "Mid Sem" : "End Sem"}
        </p>
      </div>
      <p className="text-lg font-bold text-purple-700">
        {m.score} / {m.maxScore}
      </p>
    </div>
  ))}
    </div>
    </div>
  );
}