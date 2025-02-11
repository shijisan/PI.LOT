"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Trash, Check } from "lucide-react";

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Fetch notifications when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      fetchNotifications(); // ✅ Refresh after updating
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" });
      fetchNotifications(); // ✅ Refresh after deletion
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="relative">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-2 bg-gray-100 rounded-lg flex justify-between items-center"
                >
                  <span>{notification.message}</span>
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <Button variant="primary" size="icon" onClick={() => markAsRead(notification.id)}>
                        <Check size={16} />
                      </Button>
                    )}
                    <Button variant="destructive" size="icon" onClick={() => deleteNotification(notification.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No notifications</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationButton;
