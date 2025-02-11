"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const ManageUsersModal = ({ isOpen, onClose, organizationId }) => {
   const [members, setMembers] = useState([]);
   const [error, setError] = useState(null);
   const [newUserEmail, setNewUserEmail] = useState("");
   const [newUserRole, setNewUserRole] = useState("MEMBER");
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!isOpen) return;

      const fetchMembers = async () => {
         try {
            const response = await fetch(`/api/organization/${organizationId}/members`);
            if (!response.ok) throw new Error("Failed to fetch members");

            const data = await response.json();
            setMembers(data);
         } catch (err) {
            setError(err.message);
         }
      };

      fetchMembers();
   }, [isOpen, organizationId]);

   const handleAddMember = async () => {
      if (!newUserEmail) return alert("Please enter an email");

      setLoading(true);
      try {
         const response = await fetch(`/api/organization/${organizationId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newUserEmail, role: newUserRole }),
         });

         if (!response.ok) throw new Error("Failed to add member");

         const newMember = await response.json();
         setMembers((prev) => [...prev, newMember]);
         setNewUserEmail("");
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleUpdateRole = async (userId, newRole) => {
      try {
         const response = await fetch(`/api/organization/${organizationId}/members/${userId}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
         });

         if (!response.ok) throw new Error("Failed to update role");

         setMembers((prev) =>
            prev.map((member) => (member.userId === userId ? { ...member, role: newRole } : member))
         );
      } catch (err) {
         setError(err.message);
      }
   };

   const handleRemoveMember = async (userId) => {
      if (!confirm("Are you sure you want to remove this member?")) return;

      try {
         const response = await fetch(`/api/organization/${organizationId}/members/${userId}`, {
            method: "DELETE",
         });

         if (!response.ok) throw new Error("Failed to remove member");

         setMembers((prev) => prev.filter((member) => member.userId !== userId));
      } catch (err) {
         setError(err.message);
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Manage Users</DialogTitle>
            </DialogHeader>

            {error && <p className="text-red-500">{error}</p>}

            {/* ✅ Add New Member */}
            <div className="flex gap-2 mb-4">
               <Input
                  type="email"
                  placeholder="Enter email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
               />
               <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger className="w-[120px]">
                     <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="MEMBER">Member</SelectItem>
                     <SelectItem value="MODERATOR">Moderator</SelectItem>
                     <SelectItem value="OWNER">Owner</SelectItem>
                  </SelectContent>
               </Select>
               <Button onClick={handleAddMember} disabled={loading}>
                  {loading ? "Adding..." : "Add"}
               </Button>
            </div>

            {/* ✅ List Members */}
            <ul className="space-y-3">
               {members.length > 0 ? (
                  members.map((member) => (
                     <li key={member.userId} className="flex justify-between items-center p-2 border rounded-md">
                        <span>{member.username} ({member.role})</span>
                        <div className="flex gap-2">
                           {/* ✅ Update Role */}
                           <Select value={member.role} onValueChange={(newRole) => handleUpdateRole(member.userId, newRole)}>
                              <SelectTrigger className="w-[120px]">
                                 <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="MEMBER">Member</SelectItem>
                                 <SelectItem value="MODERATOR">Moderator</SelectItem>
                                 <SelectItem value="OWNER">Owner</SelectItem>
                              </SelectContent>
                           </Select>

                           {/* ✅ Remove User */}
                           <Button variant="destructive" onClick={() => handleRemoveMember(member.userId)}>
                              Remove
                           </Button>
                        </div>
                     </li>
                  ))
               ) : (
                  <p className="text-gray-500">No members found</p>
               )}
            </ul>

            <DialogClose asChild>
               <Button variant="secondary">Close</Button>
            </DialogClose>
         </DialogContent>
      </Dialog>
   );
};

export default ManageUsersModal;
