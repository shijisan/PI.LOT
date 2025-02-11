"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function UpdateProfileDialog({ open, setOpen, user, setUser, loading, setLoading, setError }) {
   const [form, setForm] = useState({ username: user.username, email: user.email });
 
   const handleChange = (e) => {
     setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
     if (setError) setError("");
   };
 
   const handleUpdate = async (e) => {
     e.preventDefault();
     setLoading(prev => ({ ...prev, update: true }));
     setError("");
 
     try {
       const res = await fetch("/api/dashboard", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(form),
       });
 
       if (!res.ok) throw new Error(`Failed to update profile: ${res.status}`);
 
       const data = await res.json();
       setUser(data.user);
       setOpen(false);
     } catch (err) {
       setError(`Update failed: ${err.message}`);
     } finally {
       setLoading(prev => ({ ...prev, update: false }));
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Update Profile</DialogTitle>
           <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
         </DialogHeader>
         <form onSubmit={handleUpdate} className="space-y-4">
           <Input id="username" type="text" value={form.username} onChange={handleChange} required />
           <Input id="email" type="email" value={form.email} onChange={handleChange} required />
           <DialogFooter>
             <Button type="submit" disabled={loading.update}>{loading.update ? "Saving..." : "Save changes"}</Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }