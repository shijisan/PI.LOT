import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in /api/auth/user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
