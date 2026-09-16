"use client";

import { useEffect, useState } from "react";

type SubjectStat = {
  subjectId: string;
  subjectName: string;
  totalClasses: number;
  present: number;
  percentage: number;
};

type AttendanceData = {
  overall: { total: number; present: number; percentage: number };
  subjects: SubjectStat[];
};

export default function StudentDashboard() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/attendance")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Failed to load attendance.</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">My Attendance</h1>

      <div className="mb-8 rounded-lg bg-blue-50 p-6 text-center">
        <p className="text-sm text-gray-600">Overall Attendance</p>
        <p className="text-4xl font-bold text-blue-700">{data.overall.percentage}%</p>
        <p className="text-sm text-gray-500">
          {data.overall.present} / {data.overall.total} classes attended
        </p>
      </div>

      <h2 className="mb-3 font-semibold text-gray-800">Subject-wise Breakdown</h2>
      <div className="space-y-3">
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
    </div>
  );
}