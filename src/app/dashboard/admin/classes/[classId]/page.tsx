"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ClassData = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

type StudentProfile = {
  id: string;
  rollNo: string;
  user: { name: string; email: string };
  placement: { status: "NOT_PLACED" | "PLACED" | "INTERN"; company: string | null; role: string | null } | null;
};

export default function ClassDetailsPage() {
  const { classId } = useParams();
  const router = useRouter();
  const [classInfo, setClassInfo] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch class details and students for this class
    const fetchData = async () => {
      setLoading(true);
      try {
        // Find the class name from /api/classes
        const classesRes = await fetch("/api/classes");
        const classesData: ClassData[] = await classesRes.json();
        const currentClass = classesData.find(c => c.id === classId);
        if (currentClass) {
          setClassInfo(currentClass);
        }

        // Fetch students from directory API (which already supports classId filter)
        // Ensure you are using the directory API appropriately for admin or it has access
        const studentsRes = await fetch(`/api/directory?classId=${classId}`);
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (classId) {
      fetchData();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 inline-block">
          ← Back to Classes
        </button>
        <div className="h-10 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-96 w-full animate-pulse rounded-xl bg-slate-200 mt-6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <button onClick={() => router.back()} className="text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 inline-block transition-soft">
          ← Back to Classes
        </button>
        <h1 className="text-3xl font-bold text-slate-900">
          {classInfo ? `${classInfo.name} Directory` : "Class Directory"}
        </h1>
        {classInfo && (
          <p className="mt-1 text-sm text-slate-500">
            Year {classInfo.year || "-"} • Batch {classInfo.batch || "-"}
          </p>
        )}
      </div>

      <div className="rounded-xl card-shadow overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Roll No
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No students registered in this class yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-soft">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {student.rollNo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                      {student.user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {student.user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {student.placement && student.placement.status !== "NOT_PLACED" ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {student.placement.status === "INTERN" ? "Intern" : "Placed"}
                          {student.placement.company && ` @ ${student.placement.company}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          Not Placed
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/profile/${student.rollNo}`}
                        className="font-medium text-amber-600 hover:text-amber-900 transition-soft"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
