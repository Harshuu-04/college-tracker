import { auth } from "@/../auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "STUDENT") {
    redirect("/dashboard/student");
  } else if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (session.user.role === "TEACHER") {
    redirect("/dashboard/teacher");
  }

  redirect("/login");
}
