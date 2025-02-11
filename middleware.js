import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken");

  // Redirect to login if no token for protected routes
  if (req.nextUrl.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check organization membership for /app/organizations/[id] routes
  if (req.nextUrl.pathname.startsWith("/app/organizations")) {
    const id = req.nextUrl.pathname.split("/").at(3); // Safer ID extraction

    if (!token?.value) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Fetch the user's organization membership from your backend
      const response = await fetch(
        `${req.nextUrl.origin}/api/organization/${id}/check-membership`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value}`, // Ensure token exists
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to check membership:", response.statusText);
        return NextResponse.redirect(new URL("/not-authorized", req.url));
      }

      const { isMember } = await response.json();

      if (!isMember) {
        return NextResponse.redirect(new URL("/not-authorized", req.url));
      }
    } catch (error) {
      console.error("Error checking membership:", error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/organizations/:path*"],
};
