import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ POST - Unassign a task
export async function POST(req, { params }) {
  const { id: organizationId, taskId } = await params;

  try {
    // Fetch the task details to include in the notification message
    const task = await prisma.task.findUnique({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Unassign the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId, organizationId },
      data: { assignedToId: null },
    });

    // Optionally, create a notification for the previously assigned user
    if (task.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          message: `Your task "${task.title}" has been unassigned.`,
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error unassigning task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}