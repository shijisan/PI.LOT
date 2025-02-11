import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ GET: Fetch all members of the organization
export async function GET(req, { params }) {
   try {
      const { id } = await params;
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if user is part of the organization
      const organizationUser = await prisma.organizationUser.findUnique({
         where: { userId_organizationId: { userId: user.id, organizationId: id } },
      });

      if (!organizationUser) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const members = await prisma.organizationUser.findMany({
         where: { organizationId: id },
         include: { user: { select: { id: true, username: true, email: true } } },
      });

      return NextResponse.json(members.map((m) => ({
         userId: m.user.id,
         username: m.user.username,
         email: m.user.email,
         role: m.role,
      })));
   } catch (error) {
      console.error("Error fetching members:", error);
      return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
   }
}

// ✅ POST: Add a new member to the organization
export async function POST(req, { params }) {
   try {
      const { id } = params;
      const { email, role } = await req.json();
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Only OWNER or MODERATOR can add members
      const currentUserRole = await prisma.organizationUser.findUnique({
         where: { userId_organizationId: { userId: user.id, organizationId: id } },
      });

      if (!currentUserRole || (currentUserRole.role !== "OWNER" && currentUserRole.role !== "MODERATOR")) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const newUser = await prisma.user.findUnique({ where: { email } });

      if (!newUser) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const existingMember = await prisma.organizationUser.findUnique({
         where: { userId_organizationId: { userId: newUser.id, organizationId: id } },
      });

      if (existingMember) {
         return NextResponse.json({ error: "User is already a member" }, { status: 400 });
      }

      const newMember = await prisma.organizationUser.create({
         data: { userId: newUser.id, organizationId: id, role },
      });

      return NextResponse.json({
         userId: newUser.id,
         username: newUser.username,
         email: newUser.email,
         role: newMember.role,
      });
   } catch (error) {
      console.error("Error adding member:", error);
      return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
   }
}
