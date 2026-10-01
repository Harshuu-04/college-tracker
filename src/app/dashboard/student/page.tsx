"use client";

import LogoutButton from "@/components/LogoutButton";

export default function StudentDashboard() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <LogoutButton />
      </div>
      <p className="text-gray-600">Profile editor coming next.</p>
    </div>
  );
}