import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/my-info`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    redirect("/auth/signin");
  }

  const data = await response.json();
  const role = data.user?.role?.toLowerCase();

  if (role === "admin" || role === "staff") {
    redirect("/admin/dashboard");
  }

  if (role === "client") {
    // Whatever your client landing page is
    redirect("https://ekpratishat.com"); // only if / is NOT itself the redirecting page
  }

  redirect("/auth/signin");
}