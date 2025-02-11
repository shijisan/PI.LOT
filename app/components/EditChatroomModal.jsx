import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

const EditChatroomModal = ({ isOpen, onClose, chatroomId, organizationId, onChatroomUpdated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen && chatroomId) {
      const fetchData = async () => {
        setIsFetching(true);
        try {
          // Fetch chatroom details, members, labels, and users in parallel
          const [chatroomRes, membersRes, labelsRes, usersRes] = await Promise.all([
            fetch(`/api/organization/${organizationId}/chatrooms/${chatroomId}`),
            fetch(`/api/organization/${organizationId}/chatrooms/${chatroomId}/members`),
            fetch(`/api/organization/${organizationId}/labels`),
            fetch(`/api/organization/${organizationId}/members`),
          ]);

          if (!chatroomRes.ok || !membersRes.ok || !labelsRes.ok || !usersRes.ok) {
            throw new Error("Failed to fetch data");
          }

          const chatroomData = await chatroomRes.json();
          const membersData = await membersRes.json();
          const labelsData = await labelsRes.json();
          const usersData = await usersRes.json();

          // Set chatroom name and description
          setName(chatroomData.name || "");
          setDescription(chatroomData.description || "");

          // Pre-select users who already have access
          const userAccessSet = new Set(membersData.map((user) => user.userId));
          setSelectedUsers(userAccessSet);

          // Pre-select labels that already have access
          const labelAccessSet = new Set(chatroomData.labelAccess.map((access) => access.labelId));
          setSelectedLabels(labelAccessSet);

          // Set labels and users
          setLabels(labelsData);
          setUsers(usersData);
        } catch (err) {
          console.error(err.message);
        } finally {
          setIsFetching(false);
        }
      };

      fetchData();
    }
  }, [isOpen, chatroomId, organizationId]);

  const handleLabelToggle = (labelId) => {
    setSelectedLabels((prev) => {
      const newSet = new Set(prev);
      newSet.has(labelId) ? newSet.delete(labelId) : newSet.add(labelId);
      return newSet;
    });
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  };

  const handleUpdateChatroom = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organization/${organizationId}/chatrooms/${chatroomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          allowedUserIds: Array.from(selectedUsers),
          allowedLabels: Array.from(selectedLabels),
        }),
      });

      if (response.ok) {
        const updatedChatroom = await response.json();
        onChatroomUpdated(updatedChatroom);
        onClose();
      } else {
        console.error("Failed to update chatroom");
      }
    } catch (error) {
      console.error("Error updating chatroom:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chatroom</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isFetching ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input placeholder="Chatroom Name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          {isFetching ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input placeholder="Chatroom Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          )}
          <div>
            <p className="text-sm font-semibold">Allowed Labels</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isFetching ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                labels.map((label) => (
                  <label key={label.id} className="flex items-center space-x-2">
                    <Checkbox checked={selectedLabels.has(label.id)} onCheckedChange={() => handleLabelToggle(label.id)} />
                    <span>{label.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Allowed Users</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isFetching ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                users.map((user) => (
                  <label key={user.userId} className="flex items-center space-x-2">
                    <Checkbox checked={selectedUsers.has(user.userId)} onCheckedChange={() => handleUserToggle(user.userId)} />
                    <span>{user.username}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleUpdateChatroom} disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChatroomModal;