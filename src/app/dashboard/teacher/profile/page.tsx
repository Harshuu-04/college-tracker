"use client";

import { useState, useEffect } from "react";

export default function TeacherProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/profile")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!data || data.error) return <div className="p-8 text-center text-red-500">Error loading profile</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#002147] font-serif">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your teacher account details.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-[#002147] text-white rounded-full flex items-center justify-center text-3xl font-serif">
            {data.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
            <p className="text-gray-500">{data.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Committee Role</h3>
            <p className="text-gray-900 font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-md inline-block">
              {data.committeeRole.replace("_", " ")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Classes Assigned</h3>
            {data.classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.classes.map((c: any) => (
                  <span key={c.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm">
                    {c.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No specific classes assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
