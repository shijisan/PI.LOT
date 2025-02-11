import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/getCurrentUser";

// ✅ PATCH: Update a member's role
export async function PATCH(req, { params }) {
   try {
      const { id, userId } = params;
      const { role } = await req.json();
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Only OWNER or MODERATOR can change roles
      const currentUserRole = await prisma.organizationUser.findUnique({
         where: { userId_organizationId: { userId: user.id, organizationId: id } },
      });

      if (!currentUserRole || currentUserRole.role !== "OWNER") {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updatedMember = await prisma.organizationUser.update({
         where: { userId_organizationId: { userId, organizationId: id } },
         data: { role },
      });

      return NextResponse.json({ success: true, role: updatedMember.role });
   } catch (error) {
      console.error("Error updating role:", error);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
   }
}


// ✅ DELETE: Remove a member from the organization
export async function DELETE(req, { params }) {
   try {
      const { id, userId } = params;
      const user = await getCurrentUser();

      if (!user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Only OWNER or MODERATOR can remove members
      const currentUserRole = await prisma.organizationUser.findUnique({
         where: { userId_organizationId: { userId: user.id, organizationId: id } },
      });

      if (!currentUserRole || currentUserRole.role !== "OWNER") {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.organizationUser.delete({
         where: { userId_organizationId: { userId, organizationId: id } },
      });

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error("Error removing member:", error);
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
   }
}
