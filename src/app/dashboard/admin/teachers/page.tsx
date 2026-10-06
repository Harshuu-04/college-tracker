"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClassModel = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

type CommitteeRole = 
  | "CONVENER"
  | "CO_CONVENER"
  | "FACULTY_COORDINATOR"
  | "HEAD_STUDENT_COORDINATOR"
  | "STUDENT_COORDINATOR";

type TeacherData = {
  id: string;
  email: string;
  name: string;
  teacher: {
    id: string;
    proctorOfClass: ClassModel[];
  } | null;
  committeeMember: {
    id: string;
    role: CommitteeRole;
  } | null;
};

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchTeachers = async (search = "") => {
    try {
      const res = await fetch(`/api/admin/teachers?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchTeachers(searchQuery);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, name: newName }),
      });
      if (res.ok) {
        setNewEmail("");
        setNewName("");
        fetchTeachers();
        alert("Teacher added successfully");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add teacher");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding teacher");
    } finally {
      setIsAdding(false);
    }
  };

  const assignRole = async (teacher: TeacherData, role: CommitteeRole) => {
    if (!confirm(`Assign ${teacher.name} as ${getRoleLabel(role)}?`)) return;
    try {
      const res = await fetch("/api/admin/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: teacher.email,
          name: teacher.name,
          role: role,
          userRole: "TEACHER",
        }),
      });
      if (res.ok) {
        fetchTeachers();
        alert(`Successfully assigned ${teacher.name} as ${getRoleLabel(role)}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to assign role: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning role");
    }
  };

  const removeRole = async (memberId: string) => {
    if (!confirm("Remove this committee role?")) return;
    try {
      const res = await fetch(`/api/admin/committee?id=${memberId}`, { method: "DELETE" });
      if (res.ok) {
        fetchTeachers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleLabel = (role: string) => {
    return role.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Teachers Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage teacher details and assign committee roles
        </p>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#002147] mb-4">Add New Teacher</h2>
        <form onSubmit={handleAddTeacher} className="flex gap-4 items-end mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#002147] focus:ring-[#002147]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#002147] focus:ring-[#002147]" />
          </div>
          <button type="submit" disabled={isAdding} className="bg-[#002147] text-white px-6 py-2 rounded-md hover:bg-[#001530] transition-colors h-10 disabled:opacity-50">
            {isAdding ? "Adding..." : "Add Teacher"}
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-[#e2a856]/30">
        <h2 className="text-xl font-bold text-[#002147] mb-4">Teachers Directory</h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#002147] focus:ring-[#002147]"
          />
          <button type="submit" className="bg-[#002147] text-white px-6 py-2 rounded-md hover:bg-[#001530] transition-colors">
            Search
          </button>
        </form>

        {loading ? (
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
        ) : teachers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
            No teachers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Committee Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proctor Classes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{t.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{t.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {t.committeeMember ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#002147]/10 text-[#002147]">
                            {getRoleLabel(t.committeeMember.role)}
                          </span>
                          <button onClick={() => removeRole(t.committeeMember!.id)} className="text-red-500 hover:text-red-700 text-xs">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {t.teacher?.proctorOfClass && t.teacher.proctorOfClass.length > 0 
                        ? t.teacher.proctorOfClass.map(c => c.name).join(", ") 
                        : "None"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="relative group inline-block">
                        <button className="text-gray-500 hover:text-[#e2a856] text-xs font-semibold px-2 py-1 rounded border border-gray-300">
                          Assign Role ▾
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 hidden group-hover:block z-10">
                          <ul className="py-1 text-xs text-gray-700">
                            <li><button onClick={() => assignRole(t, "CONVENER")} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Convener</button></li>
                            <li><button onClick={() => assignRole(t, "CO_CONVENER")} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Co-Convener</button></li>
                            <li><button onClick={() => assignRole(t, "FACULTY_COORDINATOR")} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Faculty Coordinator</button></li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

