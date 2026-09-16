import { auth } from "@/../auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <p className="text-gray-600">Role: {session.user.role}</p>
    </div>
  );
}