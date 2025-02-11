import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/getCurrentUser"; // Directly using getCurrentUser
import prisma from "@/lib/prisma"; // Assuming you're using Prisma for database access

export async function POST(request, { params }) {
  const { id } = params;

  try {
    // Get the current user directly from the cookie
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: No session found" },
        { status: 401 }
      );
    }

    // Check if the user is a member of the organization
    const isMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
      },
    });

    // Return the result
    return NextResponse.json({ isMember: !!isMember });
  } catch (error) {
    console.error("Error checking membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
