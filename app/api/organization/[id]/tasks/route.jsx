import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ GET - Fetch all tasks for the organization
export async function GET(req, { params }) {
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

    if (!userRole) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: true, // Include the assigned user's details
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST - Create a new task
export async function POST(req, { params }) {
  const { id: organizationId } = await params;
  const { title, description, status, priority, assignedToId } = await req.json();

  try {
    // Create the task
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        assignedToId: assignedToId === "UNASSIGNED" ? null : assignedToId,
        organizationId,
      },
    });

    // If the task is assigned to someone, create a notification
    if (assignedToId && assignedToId !== "UNASSIGNED") {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          message: `You have been assigned a new task: "${title}".`,
        },
      });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}