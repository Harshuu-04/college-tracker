"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClassData = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Classes Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and view student directories by class</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Classes Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a class to view its directory and student profiles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
            No classes found.
          </div>
        ) : (
          classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/dashboard/admin/classes/${cls.id}`}
              className="group flex flex-col justify-between rounded-xl card-shadow bg-white p-6 hover:-translate-y-1 hover:shadow-md transition-soft"
            >
              <div>
                <h3 className="font-semibold text-lg text-slate-900 group-hover:text-amber-600 transition-soft">
                  {cls.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Year {cls.year || "-"} • Batch {cls.batch || "-"}
                </p>
              </div>
              <div className="mt-4 flex items-center text-sm font-medium text-slate-600 group-hover:text-amber-600 transition-soft">
                View Students →
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
