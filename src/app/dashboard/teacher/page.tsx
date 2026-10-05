"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("NOT_PLACED");
  const [editCompany, setEditCompany] = useState("");
  const [editLPA, setEditLPA] = useState("");

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/teacher/dashboard");
    if (res.ok) {
      const d = await res.json();
      setData(d);
      
      const isConv = d.role === "CONVENER" || d.role === "CO_CONVENER";
      if (!isConv && d.classesManaged && d.classesManaged.length > 0) {
        setSelectedClassId(d.classesManaged[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePlacement = async (studentId: string) => {
    const res = await fetch("/api/teacher/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        status: editStatus,
        company: editCompany,
        packageLPA: editLPA
      }),
    });
    if (res.ok) {
      setEditingStudentId(null);
      fetchData();
    } else {
      alert("Failed to update placement");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  if (!data || data.error) return <div className="p-8 text-center text-red-500">Error loading dashboard</div>;

  const isConvener = data.role === "CONVENER" || data.role === "CO_CONVENER";

  // Group students by class
  const classMap = new Map();
  data.students.forEach((s: any) => {
    if (!s.class) return;
    if (!classMap.has(s.class.id)) {
      classMap.set(s.class.id, { id: s.class.id, name: s.class.name, students: [] });
    }
    classMap.get(s.class.id).students.push(s);
  });
  const groupedClasses = Array.from(classMap.values());
  const displayedStudents = selectedClassId ? data.students.filter((s: any) => s.class?.id === selectedClassId) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#002147] font-serif">Welcome, {data.role.replace("_", " ")}</h1>
        <p className="text-gray-600 mt-1">
          {isConvener ? "Select a class below to view its students." : `Managing Class: ${data.classesManaged.map((c: any) => c.name).join(", ")}`}
        </p>
      </div>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#002147] mb-6">Class Directory</h2>
        
        {isConvener && (
          <div className="flex flex-wrap gap-3 mb-6">
            {groupedClasses.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id === selectedClassId ? null : c.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedClassId === c.id ? 'bg-[#002147] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {c.name} ({c.students.length})
              </button>
            ))}
            {groupedClasses.length === 0 && <p className="text-sm text-gray-500">No classes found.</p>}
          </div>
        )}

        {selectedClassId ? (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students in {classMap.get(selectedClassId)?.name}</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{s.rollNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{s.user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {editingStudentId === s.id ? (
                        <div className="flex flex-col gap-2">
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="text-sm border rounded p-1">
                            <option value="NOT_PLACED">Not Placed</option>
                            <option value="PLACED">Placed</option>
                            <option value="INTERN">Intern</option>
                          </select>
                          {(editStatus === "PLACED" || editStatus === "INTERN") && (
                            <>
                              <input type="text" placeholder="Company" value={editCompany} onChange={e => setEditCompany(e.target.value)} className="text-sm border rounded p-1" />
                              <input type="number" placeholder="LPA" value={editLPA} onChange={e => setEditLPA(e.target.value)} className="text-sm border rounded p-1" />
                            </>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdatePlacement(s.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
                            <button onClick={() => setEditingStudentId(null)} className="text-xs bg-gray-300 text-black px-2 py-1 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            s.placement?.status === "PLACED" ? "bg-green-100 text-green-800" :
                            s.placement?.status === "INTERN" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {s.placement?.status?.replace("_", " ") || "NOT PLACED"}
                          </span>
                          {s.placement?.company && <div className="text-xs text-gray-500 mt-1">{s.placement.company} ({s.placement.packageLPA} LPA)</div>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium flex gap-3">
                      <Link href={`/profile/${s.rollNo}`} className="text-[#002147] hover:underline" target="_blank">View</Link>
                      {editingStudentId !== s.id && (
                        <button onClick={() => {
                          setEditingStudentId(s.id);
                          setEditStatus(s.placement?.status || "NOT_PLACED");
                          setEditCompany(s.placement?.company || "");
                          setEditLPA(s.placement?.packageLPA?.toString() || "");
                        }} className="text-[#e2a856] hover:underline">Edit Status</button>
                      )}
                    </td>
                  </tr>
                ))}
                {displayedStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No students found in this class.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            {isConvener ? "Please select a class from the options above to view students." : "No class selected."}
          </div>
        )}
      </section>

      {isConvener && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#002147] mb-4">Past Placement Records</h2>
            <div className="space-y-3">
              {data.pastRecords.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-gray-800">Year {r.year}</span>
                  <a href={r.fileUrl} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">Download</a>
                </div>
              ))}
              {data.pastRecords.length === 0 && <p className="text-sm text-gray-500">No records found.</p>}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#002147] mb-4">Class-wise Details</h2>
            <div className="space-y-3">
              {data.classUploads.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium text-gray-800">{u.class.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">{u.fileType}</span>
                  </div>
                  <a href={u.fileUrl} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">Download</a>
                </div>
              ))}
              {data.classUploads.length === 0 && <p className="text-sm text-gray-500">No uploads found.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}