with open("src/app/dashboard/page.tsx", "r") as f:
    c = f.read()
c = c.replace('} else if (session.user.role === "ADMIN" || session.user.role === "TEACHER") {\n    // Teachers and Admins share the admin dashboard for now\n    redirect("/dashboard/admin");', '} else if (session.user.role === "ADMIN") {\n    redirect("/dashboard/admin");\n  } else if (session.user.role === "TEACHER") {\n    redirect("/dashboard/teacher");')
with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(c)
