-- CreateTable
CREATE TABLE "ChatroomMember" (
    "id" UUID NOT NULL,
    "chatroomId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "ChatroomMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomMember_chatroomId_userId_key" ON "ChatroomMember"("chatroomId", "userId");

-- AddForeignKey
ALTER TABLE "ChatroomMember" ADD CONSTRAINT "ChatroomMember_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomMember" ADD CONSTRAINT "ChatroomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
