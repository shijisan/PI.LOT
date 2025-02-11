import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser"; // Updated import

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationUser = await prisma.organizationUser.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId: id } },
      select: { role: true },
    });

    if (!organizationUser) {
      return NextResponse.json({ error: "User not part of this organization" }, { status: 403 });
    }

    return NextResponse.json({ role: organizationUser.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }
}
