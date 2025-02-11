import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ GET - Fetch a specific contact by ID
export async function GET(req, { params }) {
  const { id: organizationId, contactId } = params;
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

    // Fetch the specific contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId, organizationId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ PATCH - Update an existing contact
export async function PATCH(req, { params }) {
  const { id: organizationId, contactId } = await params;
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

    const updatedContact = await prisma.contact.update({
      where: { id: contactId, organizationId },
      data: {
        name,
        email,
        phone,
        position,
        company,
        notes,
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE - Delete a contact
export async function DELETE(req, { params }) {
  const { id: organizationId, contactId } = await params;
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = await prisma.organizationUser.findFirst({
      where: { userId: authUser.id, organizationId },
      select: { role: true },
    });

    if (!userRole || userRole.role !== "OWNER") {
      return NextResponse.json({ error: "Only the owner can delete a contact" }, { status: 403 });
    }

    await prisma.contact.delete({
      where: { id: contactId, organizationId },
    });

    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}