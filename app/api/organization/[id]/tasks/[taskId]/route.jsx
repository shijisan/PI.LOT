import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ PATCH - Update an existing task
export async function PATCH(req, { params }) {
  const { id: organizationId, taskId } = await params;
  const { title, description, status, priority, assignedToId } = await req.json();

  try {
    // Fetch the current task to check its previous assignment
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId, organizationId },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId, organizationId },
      data: {
        title,
        description,
        status,
        priority,
        assignedToId: assignedToId === "UNASSIGNED" ? null : assignedToId,
      },
    });

    // If the task is newly assigned to someone, create a notification
    if (
      assignedToId &&
      assignedToId !== "UNASSIGNED" &&
      assignedToId !== currentTask.assignedToId
    ) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          message: `You have been assigned a task: "${title}".`,
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE - Delete a task
export async function DELETE(req, { params }) {
  const { id: organizationId, taskId } = await params;
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
      return NextResponse.json({ error: "Only the owner can delete a task" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId, organizationId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}