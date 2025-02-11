import { prisma } from "@/lib/prisma"; // Assuming you're using Prisma for database access

export async function GET(req, { params }) {
  const { id } = await params; // Access id directly from params

  try {
    // Fetch organization details
    const organization = await prisma.organization.findUnique({
      where: { id }, // id is a string, so no need for Number(id)
      select: {
        id: true,
        name: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            username: true, // Assuming User has a 'username' field, adjust as necessary
          }
        },
        members: {
          select: {
            userId: true,
            role: true, // Assuming each member has a 'role' field
          }
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(organization), { status: 200 });
  } catch (error) {
    console.error("Error fetching organization details:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
