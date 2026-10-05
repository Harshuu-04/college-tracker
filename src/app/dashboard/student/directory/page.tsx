"use client";

import { useEffect, useState } from "react";
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
  class: { name: string; batch: string | null };
  placement: { status: "NOT_PLACED" | "PLACED" | "INTERN"; company: string | null } | null;
};

export default function DirectoryPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedClassId) params.append("classId", selectedClassId);

      try {
        const res = await fetch(`/api/directory?${params.toString()}`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [debouncedSearch, selectedClassId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">Student Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Find and connect with your peers
          </p>
        </div>
      </div>

      <div className="rounded-xl card-shadow bg-white p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 transition-soft shadow-sm"
            />
          </div>
          <div className="sm:w-64">
            <label htmlFor="classFilter" className="sr-only">Filter by Class</label>
            <select
              id="classFilter"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-amber-500 focus:ring-amber-500 shadow-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.batch ? `(${c.batch})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
          No students found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {students.map((student) => (
            <Link 
              key={student.id} 
              href={`/profile/${student.rollNo}`}
              className="group flex flex-col justify-between rounded-xl card-shadow bg-white p-5 hover:-translate-y-1 hover:shadow-md transition-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-soft">
                    {student.user.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{student.rollNo}</p>
                </div>
                {student.placement && student.placement.status !== "NOT_PLACED" ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {student.placement.status === "INTERN" ? "Intern" : "Placed"}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    Open to Work
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-500">
                  <span className="truncate max-w-[120px]">{student.class.name} {student.class.batch && `- ${student.class.batch}`}</span>
                </div>
                {student.placement && student.placement.company && (
                  <div className="text-slate-700 font-medium truncate max-w-[120px]">
                    @ {student.placement.company}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
