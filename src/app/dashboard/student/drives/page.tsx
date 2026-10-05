"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Drive = {
  id: string;
  companyName: string;
  role: string;
  type: string;
  packageLPA: number | null;
  description: string;
  driveDate: string;
  registrationDeadline: string;
  minCgpa: number | null;
  maxBacklogs: number | null;
  isEligible: boolean;
  isRegistered: boolean;
  isDeadlinePassed: boolean;
};

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/drives")
      .then((res) => res.json())
      .then((data) => {
        setDrives(data);
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
          <h1 className="text-3xl">Placement Drives</h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover and apply for upcoming recruitment drives
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-200 h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Placement Drives</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover and apply for upcoming recruitment drives
        </p>
      </div>

      {drives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4 text-slate-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">No Drives Available</h3>
          <p className="text-sm text-slate-500 mt-1">There are currently no placement drives listed.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {drives.map((drive) => (
            <div key={drive.id} className="flex flex-col rounded-xl card-shadow overflow-hidden transition-soft card-hover">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{drive.companyName}</h3>
                    <p className="text-sm text-slate-600 font-medium">{drive.role}</p>
                  </div>
                  {drive.isEligible ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Eligible
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      Not Eligible
                    </span>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                    {drive.type}
                  </span>
                  {drive.packageLPA && (
                    <span className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700">
                      {drive.packageLPA} LPA
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                  {drive.description || "No description provided."}
                </p>
                
                <div className="space-y-2 text-sm text-slate-500 mb-6">
                  <div className="flex justify-between">
                    <span>Drive Date:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(drive.driveDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className={`font-medium ${drive.isDeadlinePassed ? 'text-red-600' : 'text-slate-900'}`}>
                      {new Date(drive.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/student/drives/${drive.id}`}
                  className="w-full text-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-soft hover:bg-slate-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
