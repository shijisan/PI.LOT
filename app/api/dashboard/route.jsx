import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username, email } = await req.json();
  if (!username || !email) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { username, email },
  });

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ message: "Account deleted successfully" });
}
