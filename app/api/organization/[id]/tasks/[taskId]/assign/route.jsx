import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ POST - Assign a task to a user
export async function POST(req, { params }) {
  const { id: organizationId, taskId } = await params;
  const { userId } = await req.json();

  try {
    // Fetch the task details to include in the notification message
    const task = await prisma.task.findUnique({
      where: { id: taskId, organizationId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Assign the task to the user
    const updatedTask = await prisma.task.update({
      where: { id: taskId, organizationId },
      data: { assignedToId: userId },
    });

    // Create a notification for the assigned user
    await prisma.notification.create({
      data: {
        userId: userId,
        message: `You have been assigned a task: "${task.title}".`,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}