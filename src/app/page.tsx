import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (userId && userRole) {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/sale/dashboard");
    }
  }

  redirect("/login");
}

