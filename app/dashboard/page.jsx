"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OrganizationCard from "@/app/components/OrganizationCard";
import UserProfile from "@/app/components/UserProfile";
import UpdateProfileDialog from "@/app/components/UpdateProfileDialog";
import DeleteAccountDialog from "@/app/components/DeleteAccountDialog";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    fetch: true,
    update: false,
    delete: false,
  });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setError(`Failed to load user data: ${err.message}`);
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      router.push("/login");
    } catch (err) {
      setError(`Logout failed: ${err.message}`);
    }
  };

  if (loading.fetch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="pattern bg-gray-100">
      <div className="max-w-6xl flex md:flex-row flex-col items-center justify-center min-h-screen w-full mx-auto p-4">
        <UserProfile
          user={user}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          setIsUpdateModalOpen={setIsUpdateModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          handleLogout={handleLogout}
        />
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-4">
          <OrganizationCard organizations={user.organizations} user={user} />
        </div>
      </div>

      <UpdateProfileDialog
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        user={user}
        setUser={setUser}
        loading={loading}
        setLoading={setLoading}
        setError={setError}
      />

      <DeleteAccountDialog
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        loading={loading}
        setLoading={setLoading}
        setError={setError}
        router={router}
      />
    </main>
  );
}
