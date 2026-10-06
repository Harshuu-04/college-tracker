"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";

type CommitteeRole = 
  | "CONVENER"
  | "CO_CONVENER"
  | "FACULTY_COORDINATOR"
  | "HEAD_STUDENT_COORDINATOR"
  | "STUDENT_COORDINATOR";

type CommitteeMember = {
  id: string;
  userId: string;
  role: CommitteeRole;
  user: { name: string; email: string; role: string };
};

type PastRecord = {
  id: string;
  year: number;
  fileUrl: string;
};

type ClassUpload = {
  id: string;
  classId: string;
  fileUrl: string;
  fileType: string;
  class: { name: string; year: number | null; batch: string | null };
};

type ClassModel = {
  id: string;
  name: string;
  year: number | null;
  batch: string | null;
};

type SearchResult = {
  rollNo: string;
  user: { name: string; email: string };
  class: { name: string };
  placement: { status: string; company: string | null } | null;
};

export default function AdminDashboard() {
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [pastRecords, setPastRecords] = useState<PastRecord[]>([]);
  const [classUploads, setClassUploads] = useState<ClassUpload[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Forms states
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<CommitteeRole>("STUDENT_COORDINATOR");
  const [newMemberUserRole, setNewMemberUserRole] = useState("STUDENT");

  const [recordYear, setRecordYear] = useState(new Date().getFullYear());
  
  const [uploadClassId, setUploadClassId] = useState("");
  const [uploadFileType, setUploadFileType] = useState("PDF");

  const fetchData = async () => {
    const res = await fetch("/api/admin/dashboard");
    if (res.ok) {
      const data = await res.json();
      setCommittee(data.committee || []);
      setPastRecords(data.pastRecords || []);
      setClassUploads(data.classUploads || []);
      setClasses(data.classes || []);
      if (data.classes && data.classes.length > 0 && !uploadClassId) {
        setUploadClassId(data.classes[0].id);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const res = await fetch(`/api/directory?search=${encodeURIComponent(searchQuery)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data);
    }
    setIsSearching(false);
  };

  const addCommitteeMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/committee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newMemberEmail,
        name: newMemberName,
        role: newMemberRole,
        userRole: newMemberUserRole,
      }),
    });
    if (res.ok) {
      setNewMemberEmail("");
      setNewMemberName("");
      fetchData();
    }
  };

  const removeCommitteeMember = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/admin/committee?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const removeRecord = async (id: string) => {
    if (!confirm("Remove this record?")) return;
    await fetch(`/api/admin/past-records?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const removeClassUpload = async (id: string) => {
    if (!confirm("Remove this upload?")) return;
    await fetch(`/api/admin/class-uploads?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const assignStudentToCommittee = async (student: SearchResult, role: CommitteeRole) => {
    if (!confirm(`Assign ${student.user.name} as ${getRoleLabel(role)}?`)) return;
    const res = await fetch("/api/admin/committee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: student.user.email,
        name: student.user.name,
        role: role,
        userRole: "STUDENT",
      }),
    });
    if (res.ok) {
      fetchData();
      alert(`Successfully assigned ${student.user.name} as ${getRoleLabel(role)}`);
    } else {
      const errorData = await res.json().catch(() => ({}));
      alert(`Failed to assign: ${errorData.error || "Unknown error"}`);
    }
  };

  const getRoleLabel = (role: CommitteeRole) => {
    return role.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  const renderCommitteeGroup = (role: CommitteeRole, title: string) => {
    const members = committee.filter(m => m.role === role);
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#002147] mb-3 border-b pb-1 border-gray-200">{title}</h3>
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No members assigned.</p>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {members.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                </div>
                <button onClick={() => removeCommitteeMember(m.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002147] font-serif">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage placement committee, records, and search students.</p>
        </div>
      </div>

      {/* Global Search Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-[#e2a856]/30">
        <h2 className="text-xl font-bold text-[#002147] mb-4">Student Search</h2>
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, roll no, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#002147] focus:ring-[#002147]"
          />
          <button type="submit" disabled={isSearching} className="bg-[#002147] text-white px-6 py-2 rounded-md hover:bg-[#001530] transition-colors disabled:opacity-50">
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((s) => (
                  <tr key={s.rollNo} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{s.rollNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{s.user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{s.class?.name || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        s.placement?.status === "PLACED" ? "bg-green-100 text-green-800" :
                        s.placement?.status === "INTERN" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {s.placement?.status.replace("_", " ") || "NOT PLACED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium flex gap-3 items-center">
                      <Link href={`/profile/${s.rollNo}`} className="text-[#002147] hover:underline">
                        View Profile
                      </Link>
                      
                      <select
                        className="text-gray-500 hover:text-[#e2a856] text-xs font-semibold px-2 py-1 rounded border border-gray-300 bg-transparent outline-none cursor-pointer"
                        onChange={(e) => {
                          const role = e.target.value as CommitteeRole;
                          if (role) {
                            assignStudentToCommittee(s, role);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Role ▾</option>
                        <option value="STUDENT_COORDINATOR">Student Coordinator</option>
                        <option value="HEAD_STUDENT_COORDINATOR">Head Student Coordinator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Committee Section */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#002147] mb-6">Placement Cell Committee</h2>
        
        <div className="bg-gray-50 p-5 rounded-lg mb-8 border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Add Committee Member</h3>
          <form onSubmit={addCommitteeMember} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Committee Role</label>
              <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value as CommitteeRole)} className="w-full rounded-md border-gray-300 text-sm">
                <option value="CONVENER">Convener</option>
                <option value="CO_CONVENER">Co-Convener</option>
                <option value="FACULTY_COORDINATOR">Faculty Coordinator</option>
                <option value="HEAD_STUDENT_COORDINATOR">Head Student Coordinator</option>
                <option value="STUDENT_COORDINATOR">Student Coordinator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account Role</label>
              <select value={newMemberUserRole} onChange={e => setNewMemberUserRole(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="bg-[#002147] text-white px-4 py-2 rounded-md text-sm hover:bg-[#001530] transition-colors h-10">Add</button>
          </form>
        </div>

        <div className="space-y-2">
          {renderCommitteeGroup("CONVENER", "Convener")}
          {renderCommitteeGroup("CO_CONVENER", "Co-Convener")}
          {renderCommitteeGroup("FACULTY_COORDINATOR", "Faculty Coordinators")}
          {renderCommitteeGroup("HEAD_STUDENT_COORDINATOR", "Head Student Coordinators")}
          {renderCommitteeGroup("STUDENT_COORDINATOR", "Student Coordinators")}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Past Placement Records */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#002147] mb-4">Past Placement Records</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={recordYear} onChange={e => setRecordYear(parseInt(e.target.value))} className="w-full rounded-md border-gray-300 text-sm" />
            </div>
            <FileUpload
              label="Upload Record (PDF/Excel)"
              type="pastRecord"
              accept=".pdf,.xlsx,.xls,.csv"
              onUploaded={async (url) => {
                await fetch("/api/admin/past-records", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ year: recordYear, fileUrl: url }),
                });
                fetchData();
              }}
            />
          </div>

          <div className="space-y-3">
            {pastRecords.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <span className="font-medium text-gray-800">Placement Year {r.year}</span>
                <div className="flex space-x-3">
                  <a href={r.fileUrl} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">Download</a>
                  <button onClick={() => removeRecord(r.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
            {pastRecords.length === 0 && <p className="text-sm text-gray-500">No records found.</p>}
          </div>
        </section>

        {/* Class-wise Student Details */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#002147] mb-4">Class-wise Details Upload</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={uploadClassId} onChange={e => setUploadClassId(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                <select value={uploadFileType} onChange={e => setUploadFileType(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
                  <option value="PDF">PDF</option>
                  <option value="EXCEL">Excel/CSV</option>
                </select>
              </div>
            </div>
            <FileUpload
              label="Upload Class Record"
              type="classUpload"
              accept=".pdf,.xlsx,.xls,.csv"
              onUploaded={async (url) => {
                await fetch("/api/admin/class-uploads", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ classId: uploadClassId, fileUrl: url, fileType: uploadFileType }),
                });
                fetchData();
              }}
            />
          </div>

          <div className="space-y-3">
            {classUploads.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <span className="font-medium text-gray-800">{u.class.name}</span>
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">{u.fileType}</span>
                </div>
                <div className="flex space-x-3">
                  <a href={u.fileUrl} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">Download</a>
                  <button onClick={() => removeClassUpload(u.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
            {classUploads.length === 0 && <p className="text-sm text-gray-500">No uploads found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
