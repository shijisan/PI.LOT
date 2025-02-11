"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserProfile({ user, loading, setIsUpdateModalOpen, setIsDeleteModalOpen, handleLogout }) {
  return (
    <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-4 max-h-96">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold">{user?.username}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <Button type="button" onClick={() => setIsUpdateModalOpen(true)} disabled={loading.update} className="w-full">
            {loading.update ? "Updating..." : "Update Profile"}
          </Button>
          <Button variant="destructive" type="button" onClick={() => setIsDeleteModalOpen(true)} disabled={loading.delete} className="w-full">
            {loading.delete ? "Deleting..." : "Delete Account"}
          </Button>
          <Button variant="secondary" type="button" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
