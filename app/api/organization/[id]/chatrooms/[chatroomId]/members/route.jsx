import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure the correct path for Prisma import
import { getCurrentUser } from "@/utils/getCurrentUser"; // Ensure this function is correctly implemented

export async function GET(req, { params }) {
  try {
    const { id: organizationId, chatroomId } = params;

    if (!chatroomId) {
      return NextResponse.json({ error: "Chatroom ID is required" }, { status: 400 });
    }
    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    console.log("Fetching members for chatroom:", chatroomId);

    // Get the logged-in user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the chatroom exists in the organization
    const chatroom = await prisma.chatroom.findUnique({
      where: { id: chatroomId, organizationId },
    });
    if (!chatroom) {
      return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    }

    // Fetch users with direct access to the chatroom
    const directAccessUsers = await prisma.chatroomMember.findMany({
      where: { chatroomId },
      include: { user: true },
    });

    // Fetch chatroom access rules (label-based access)
    const chatroomAccess = await prisma.chatroomAccess.findMany({
      where: { chatroomId },
      include: { label: true },
    });

    console.log("Chatroom access rules:", chatroomAccess);

    // If no restrictions exist, return all organization members
    if (chatroomAccess.length === 0 && directAccessUsers.length === 0) {
      const allMembers = await prisma.organizationUser.findMany({
        where: { organizationId },
        include: { user: true },
      });
      return NextResponse.json(
        allMembers.map((member) => ({
          userId: member.user.id,
          username: member.user.username,
          role: member.role,
        }))
      );
    }

    // Get allowed label IDs for this chatroom
    const allowedLabelIds = chatroomAccess.map((access) => access.labelId);

    // Get users who belong to these labels
    const labelBasedUsers = await prisma.organizationUser.findMany({
      where: {
        organizationId,
        labelId: { in: allowedLabelIds },
      },
      include: { user: true },
    });

    // Combine direct access users and label-based users
    const combinedUsers = [
      ...directAccessUsers.map((u) => u.user),
      ...labelBasedUsers.map((u) => u.user),
    ];

    // Remove duplicates by userId
    const uniqueUsers = Array.from(new Map(combinedUsers.map((u) => [u.id, u])).values());

    return NextResponse.json(
      uniqueUsers.map((user) => ({
        userId: user.id,
        username: user.username,
        role: "MEMBER", // Adjust role logic as needed
      }))
    );
  } catch (error) {
    console.error("Error fetching chatroom members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}