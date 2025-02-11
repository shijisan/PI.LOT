import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/getCurrentUser";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    console.log("test");

    console.log("Fetching current user...");
    const user = await getCurrentUser();

    if (!user) {
      console.log("User not found, unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User found, fetching organizations...");
    // Fetch organizations
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: { members: true },
    });

    // Log the organizations to the console for debugging
    console.log("Fetched organizations:", organizations);

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
    }

    const organization = await prisma.organization.create({
      data: {
        name: body.name.trim(),
        ownerId: user.id,
        members: {
          create: [
            {
              userId: user.id,
              role: "OWNER",
            },
          ],
        },
      },
      include: { members: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("POST Error:", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Organization name must be unique" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}