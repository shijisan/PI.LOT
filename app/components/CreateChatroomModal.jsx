import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

const CreateChatroomModal = ({ isOpen, onClose, organizationId, onChatroomCreated }) => {
  const [name, setName] = useState("");
  const [labels, setLabels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsFetching(true);
        try {
          // Fetch labels and users in parallel
          const [labelsRes, usersRes] = await Promise.all([
            fetch(`/api/organization/${organizationId}/labels`),
            fetch(`/api/organization/${organizationId}/members`),
          ]);

          if (!labelsRes.ok || !usersRes.ok) {
            throw new Error("Failed to fetch data");
          }

          const labelsData = await labelsRes.json();
          const usersData = await usersRes.json();

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
  }, [isOpen, organizationId]);

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

  const handleCreateChatroom = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organization/${organizationId}/chatrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          labelIds: Array.from(selectedLabels),
          userIds: Array.from(selectedUsers),
        }),
      });

      if (response.ok) {
        const newChatroom = await response.json();
        onChatroomCreated(newChatroom);
        onClose();
      } else {
        console.error("Failed to create chatroom");
      }
    } catch (error) {
      console.error("Error creating chatroom:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chatroom</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Chatroom Name Input */}
          {isFetching ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input placeholder="Chatroom Name" value={name} onChange={(e) => setName(e.target.value)} />
          )}

          {/* Allowed Labels Section */}
          <div>
            <p className="text-sm font-semibold">Allowed Labels</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isFetching ? (
                <Skeleton className="h-6 w-full" />
              ) : labels.length > 0 ? (
                labels.map((label) => (
                  <label key={label.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedLabels.has(label.id)}
                      onCheckedChange={() => handleLabelToggle(label.id)}
                    />
                    <span>{label.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500">No labels available</p>
              )}
            </div>
          </div>

          {/* Allowed Users Section */}
          <div>
            <p className="text-sm font-semibold">Allowed Users</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isFetching ? (
                <Skeleton className="h-6 w-full" />
              ) : users.length > 0 ? (
                users.map((user) => (
                  <label key={user.userId} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedUsers.has(user.userId)}
                      onCheckedChange={() => handleUserToggle(user.userId)}
                    />
                    <span>{user.username}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500">No users available</p>
              )}
            </div>
          </div>

          {/* Helper Text */}
          <div>
            <p className="text-gray-500 text-sm text-center">
              By not selecting any user, it can only be viewed by owners and moderators.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCreateChatroom} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatroomModal;