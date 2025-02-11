"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditTaskModal = ({ isOpen, onClose, task, organizationId, onTaskUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState(""); // ✅ State for assigned user
  const [users, setUsers] = useState([]); // ✅ State to store organization users
  const [loading, setLoading] = useState(false);

  // Fetch users in the organization
  useEffect(() => {
    const fetchOrganizationUsers = async () => {
      try {
        const response = await fetch(`/api/organization/${organizationId}/users`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (isOpen && task) {
      fetchOrganizationUsers();
    }
  }, [isOpen, task, organizationId]);

  // Initialize form fields with task data
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "PENDING");
      setPriority(task.priority || "NORMAL");
      setAssignedTo(task.assignedToId || "UNASSIGNED"); // Pre-select the currently assigned user
    }
  }, [isOpen, task]);

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/organization/${organizationId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          assignedToId: assignedTo === "UNASSIGNED" || null, // Assign to user or leave unassigned
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        onTaskUpdated(updatedTask); // Notify parent component of the updated task
        onClose(); // Close the modal
      } else {
        console.error("Failed to update task");
        alert("Failed to update task. Please try again.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("An error occurred while updating the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Title Input */}
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          {/* Description Input */}
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Status Dropdown */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Dropdown */}
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Assign To Dropdown */}
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleUpdateTask} disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;