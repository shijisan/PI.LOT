import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ GET - Fetch chatrooms the current user has access to
export async function GET(req, { params }) {
  const { id } = await params; // Organization ID
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch chatrooms where the user is a member
    const chatrooms = await prisma.chatroom.findMany({
      where: {
        organizationId: id,
        members: {
          some: { userId: authUser.id } // ✅ Only fetch chatrooms where the user is a member
        }
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    return NextResponse.json(chatrooms, { status: 200 });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json({ error: "Failed to fetch chatrooms" }, { status: 500 });
  }
}

// ✅ POST - Create a new chatroom (Only for org owner or moderator)
export async function POST(req, { params }) {
  const { id } = params; // Organization ID
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, labelIds = [], userIds = [] } = await req.json();

    // Verify if user is an organization owner or moderator
    const userRole = await prisma.organizationUser.findFirst({
      where: { organizationId: id, userId: authUser.id },
      select: { role: true },
    });

    if (!userRole || (userRole.role !== "OWNER" && userRole.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create the chatroom
    const chatroom = await prisma.chatroom.create({
      data: {
        name,
        description,
        organizationId: id,
        labelAccess: {
          create: labelIds.map(labelId => ({
            labelId
          }))
        },
        members: {
          create: userIds.map(userId => ({
            user: { connect: { id: userId } }
          }))
        }
      },
      include: {
        labelAccess: { include: { label: true } },
        members: { include: { user: true } }
      }
    });

    // Format response
    const formattedChatroom = {
      ...chatroom,
      labels: chatroom.labelAccess.map(access => access.label),
      members: chatroom.members.map(member => member.user)
    };

    return NextResponse.json(formattedChatroom, { status: 201 });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json({ error: "Failed to create chatroom" }, { status: 500 });
  }
}
