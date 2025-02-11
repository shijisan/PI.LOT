import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ GET - Fetch chatroom if user has access
export async function GET(req, { params }) {
  const { id, chatroomId } = params;
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chatroom = await prisma.chatroom.findFirst({
      where: {
        id: chatroomId,
        organizationId: id,
        OR: [
          { members: { some: { userId: authUser.id } } },
          { labelAccess: { some: { label: { members: { some: { userId: authUser.id } } } } } }
        ]
      },
      include: {
        members: true,
        labelAccess: { include: { label: true } }
      }
    });

    if (!chatroom) {
      return NextResponse.json({ error: "Chatroom not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(chatroom);
  } catch (error) {
    console.error("Error fetching chatroom:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ PATCH - Update chatroom (name, description, access)
export async function PATCH(req, { params }) {
  const { id, chatroomId } = params;
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, allowedUserIds, allowedLabelIds } = await req.json();

  try {
    const chatroom = await prisma.chatroom.findFirst({
      where: { id: chatroomId, organizationId: id },
      include: { organization: true }
    });

    if (!chatroom) {
      return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    }

    const userRole = await prisma.organizationUser.findFirst({
      where: { userId: authUser.id, organizationId: id },
      select: { role: true }
    });

    if (!userRole || (userRole.role !== "OWNER" && userRole.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const updatedChatroom = await prisma.chatroom.update({
      where: { id: chatroomId },
      data: {
        name,
        description,
        members: {
          deleteMany: {},
          create: allowedUserIds.map((userId) => ({ userId }))
        },
        labelAccess: {
          deleteMany: {},
          create: allowedLabelIds.map((labelId) => ({ labelId }))
        }
      }
    });

    return NextResponse.json(updatedChatroom);
  } catch (error) {
    console.error("Error updating chatroom:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE - Delete chatroom (only owner can delete)
export async function DELETE(req, { params }) {
  const { id, chatroomId } = params;
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRole = await prisma.organizationUser.findFirst({
      where: { userId: authUser.id, organizationId: id },
      select: { role: true }
    });

    if (!userRole || userRole.role !== "OWNER") {
      return NextResponse.json({ error: "Only the owner can delete a chatroom" }, { status: 403 });
    }

    await prisma.chatroom.delete({ where: { id: chatroomId } });

    return NextResponse.json({ message: "Chatroom deleted successfully" });
  } catch (error) {
    console.error("Error deleting chatroom:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}