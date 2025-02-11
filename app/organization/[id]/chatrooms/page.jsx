"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import OrganizationSidebar from "@/app/components/OrganizationSidebar";
import CreateChatroomModal from "@/app/components/CreateChatroomModal";
import EditChatroomModal from "@/app/components/EditChatroomModal"; // ✅ Import EditChatroomModal

const ChatroomsPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [chatrooms, setChatrooms] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchChatrooms = async () => {
      try {
        const response = await fetch(`/api/organization/${id}/chatrooms`);
        if (!response.ok) throw new Error("Failed to fetch chatrooms");
        const data = await response.json();
        setChatrooms(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchUserRole = async () => {
      try {
        const response = await fetch(`/api/organization/${id}/role`);
        if (!response.ok) throw new Error("Failed to fetch user role");
        const { role } = await response.json();
        setUserRole(role);
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    fetchChatrooms();
    fetchUserRole();
  }, [id]);

  const handleChatroomCreated = (newChatroom) => {
    setChatrooms((prev) => (prev ? [...prev, newChatroom] : [newChatroom]));
    setIsModalOpen(false);
  };

  const handleEditChatroom = (chatroom) => {
    setSelectedChatroom(chatroom);
    setIsEditModalOpen(true);
  };

  const handleChatroomUpdated = (updatedChatroom) => {
    setChatrooms((prev) =>
      prev.map((chatroom) => (chatroom.id === updatedChatroom.id ? updatedChatroom : chatroom))
    );
  };

  const handleDeleteChatroom = async (chatroomId) => {
    if (!confirm("Are you sure you want to delete this chatroom?")) return;

    try {
      const response = await fetch(`/api/organization/${id}/chatrooms/${chatroomId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete chatroom");

      setChatrooms((prev) => prev.filter((chatroom) => chatroom.id !== chatroomId));
    } catch (err) {
      console.error("Error deleting chatroom:", err);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-100 pattern">
      <div className="max-w-6xl flex md:flex-row flex-col w-full gap-6">
        {/* Sidebar Navigation */}
        <OrganizationSidebar id={id} />

        {/* Chatrooms Content */}
        <Card className="w-full md:w-4/5 shadow-lg border rounded-2xl p-6 bg-white">
          <CardHeader>
            <div className="flex flex-row justify-between items-center">
              <CardTitle className="text-2xl font-bold">Chatrooms</CardTitle>
              {(userRole === "OWNER" || userRole === "MODERATOR") && (
                <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                  Create Chatroom
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {chatrooms ? (
              <ul className="space-y-4">
                {chatrooms.length > 0 ? (
                  chatrooms.map((chatroom) => (
                    <li
                      key={chatroom.id}
                      className="bg-gray-50 border rounded-lg p-3 text-gray-700 cursor-pointer hover:bg-gray-100 transition flex justify-between items-center"
                    >
                      <div
                        onClick={() =>
                          router.push(`/organization/${id}/chatrooms/${chatroom.id}`)
                        }
                        className="flex-1 cursor-pointer"
                      >
                        <strong>{chatroom.name}</strong>
                        <p className="text-sm text-gray-500">{chatroom.description}</p>
                      </div>

                      {/* Edit / Delete Buttons */}
                      {(userRole === "OWNER" || userRole === "MODERATOR") && (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleEditChatroom(chatroom)}>
                            Edit
                          </Button>
                          <Button variant="destructive" onClick={() => handleDeleteChatroom(chatroom.id)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No chatrooms found</p>
                )}
              </ul>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Chatroom Modal */}
      <CreateChatroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organizationId={id}
        onChatroomCreated={handleChatroomCreated}
      />

      {/* Edit Chatroom Modal */}
      <EditChatroomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        chatroomId={selectedChatroom?.id}
        organizationId={id}
        onChatroomUpdated={handleChatroomUpdated}
      />
    </main>
  );
};

export default ChatroomsPage;
