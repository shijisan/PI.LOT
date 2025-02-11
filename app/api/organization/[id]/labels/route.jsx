import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure this points to your Prisma instance

export async function GET(req, { params }) {
  try {
    const { id } = await params; // Extract organization ID from URL

    if (!id) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const labels = await prisma.label.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    return NextResponse.json(labels);
  } catch (error) {
    console.error("Error fetching labels:", error);
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 });
  }
}
