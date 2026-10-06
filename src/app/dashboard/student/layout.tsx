import { auth } from "@/../auth";
import Navbar from "@/components/layout/Navbar";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
