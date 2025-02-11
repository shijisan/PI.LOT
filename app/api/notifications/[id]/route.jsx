import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/getCurrentUser"; // Import getCurrentUser utility
import { prisma } from "@/lib/prisma"; // Import Prisma client

// PATCH: Mark a notification as read
export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Update the notification's isRead status to true
    const notification = await prisma.notification.update({
      where: {
        id: id,
        userId: currentUser.id, // Ensure the notification belongs to the current user
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a notification
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Delete the notification from the database
    await prisma.notification.delete({
      where: {
        id: id,
        userId: currentUser.id, // Ensure the notification belongs to the current user
      },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}