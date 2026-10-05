import os
for route in [
    "src/app/dashboard/admin/layout.tsx",
    "src/app/api/admin/dashboard/route.ts",
    "src/app/api/admin/committee/route.ts",
    "src/app/api/admin/past-records/route.ts",
    "src/app/api/admin/class-uploads/route.ts",
    "src/app/api/admin/drives/route.ts",
    "src/app/api/admin/seed-classes/route.ts"
]:
    if os.path.exists(route):
        with open(route, "r") as f:
            c = f.read()
        c = c.replace('if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {', 'if (!session || session.user.role !== "ADMIN") {')
        with open(route, "w") as f:
            f.write(c)
