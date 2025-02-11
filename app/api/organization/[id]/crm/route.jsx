import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ GET - Fetch all contacts for the organization
export async function GET(req, { params }) {
  const { id: organizationId } = await params;
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the user is part of the organization
    const userRole = await prisma.organizationUser.findFirst({
      where: { userId: authUser.id, organizationId },
      select: { role: true },
    });

    if (!userRole) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch all contacts for the organization
    const contacts = await prisma.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST - Create a new contact
export async function POST(req, { params }) {
  const { id: organizationId } = await params;
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = await prisma.organizationUser.findFirst({
      where: { userId: authUser.id, organizationId },
      select: { role: true },
    });

    if (!userRole || (userRole.role !== "OWNER" && userRole.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { name, email, phone, position, company, notes } = await req.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        position,
        company,
        notes,
        organizationId,
      },
    });

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
