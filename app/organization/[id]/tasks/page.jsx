"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import OrganizationSidebar from "@/app/components/OrganizationSidebar";
import CreateTaskModal from "@/app/components/CreateTaskModal"; // ✅ Import modal for creating tasks
import EditTaskModal from "@/app/components/EditTaskModal"; // ✅ Import modal for editing tasks
import DeleteTaskModal from "@/app/components/DeleteTaskModal"; // ✅ Import delete confirmation modal

const Tasks = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // ✅ State for delete confirmation modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [userRole, setUserRole] = useState(null); // ✅ State to store the user's role
  const [currentUser, setCurrentUser] = useState(null); // ✅ State to store the current user's data

  useEffect(() => {
    const fetchUserDataAndTasks = async () => {
      try {
        // Fetch the current user's data
        const currentUserRes = await fetch("/api/auth/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!currentUserRes.ok) throw new Error("Failed to fetch current user");
        const currentUserData = await currentUserRes.json();
        setCurrentUser(currentUserData);

        // Fetch the user's role in the organization
        const userRes = await fetch(`/api/organization/${id}/role`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!userRes.ok) throw new Error("Failed to fetch user role");
        const userData = await userRes.json();
        setUserRole(userData.role);

        // Fetch all tasks for the organization
        const tasksRes = await fetch(`/api/organization/${id}/tasks`);
        if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndTasks();
  }, [id]);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setIsEditModalOpen(false);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      const response = await fetch(`/api/organization/${id}/tasks/${selectedTask.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        handleTaskDeleted(selectedTask.id); // Remove the task from the state
        setIsDeleteModalOpen(false); // Close the modal
      } else {
        console.error("Failed to delete task");
        alert("Failed to delete task. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("An error occurred while deleting the task.");
    }
  };

  const handleTakeTask = async (taskId) => {
    try {
      const response = await fetch(`/api/organization/${id}/tasks/${taskId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }), // Assign the task to the current user
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );
      } else {
        console.error("Failed to take task");
        alert("Failed to take task. Please try again.");
      }
    } catch (error) {
      console.error("Error taking task:", error);
      alert("An error occurred while taking the task.");
    }
  };

  const handleUnassignTask = async (taskId) => {
    try {
      const response = await fetch(`/api/organization/${id}/tasks/${taskId}/unassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );
      } else {
        console.error("Failed to unassign task");
        alert("Failed to unassign task. Please try again.");
      }
    } catch (error) {
      console.error("Error unassigning task:", error);
      alert("An error occurred while unassigning the task.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl flex md:flex-row flex-col w-full gap-6">
        {/* Sidebar Navigation */}
        <OrganizationSidebar id={id} />

        {/* Tasks Content */}
        <Card className="w-full md:w-4/5 shadow-lg border rounded-2xl p-6 bg-white">
          <CardHeader>
            <div className="flex flex-row justify-between items-center">
              <CardTitle className="text-2xl font-bold">Tasks</CardTitle>
              {/* Show "Create Task" button only for OWNER or MODERATOR */}
              {(userRole === "OWNER" || userRole === "MODERATOR") && (
                <Button onClick={() => setIsCreateModalOpen(true)} variant="secondary">
                  Create Task
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center border-b py-2"
                  >
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description || "No description"}</p>
                      <p className="text-xs text-gray-400">
                        Status: {task.status} | Priority: {task.priority}
                      </p>
                      <p className="text-xs text-gray-400">
                        Assigned To:{" "}
                        {task.assignedTo ? task.assignedTo.username : "Unassigned"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!task.assignedTo && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event propagation
                            handleTakeTask(task.id);
                          }}
                          variant="outline"
                        >
                          Take Task
                        </Button>
                      )}
                      {task.assignedTo?.id === currentUser?.id && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event propagation
                            handleUnassignTask(task.id);
                          }}
                          variant="destructive"
                        >
                          Unassign
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event propagation
                          setSelectedTask(task);
                          setIsEditModalOpen(true);
                        }}
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event propagation
                          setSelectedTask(task);
                          setIsDeleteModalOpen(true); // Open the delete confirmation modal
                        }}
                        variant="destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tasks available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={id}
        onTaskCreated={handleTaskCreated}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        organizationId={id}
        onTaskUpdated={handleTaskUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteTask} // Pass the delete handler to the modal
      />
    </main>
  );
};

export default Tasks;