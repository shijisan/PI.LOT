"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function DeleteAccountDialog({ open, setOpen, loading, setLoading, setError, router }) {
   const handleDelete = async () => {
     setLoading(prev => ({ ...prev, delete: true }));
     try {
       const res = await fetch("/api/dashboard", { method: "DELETE" });
       if (!res.ok) throw new Error(`Failed to delete account: ${res.status}`);
       router.push("/login");
     } catch (err) {
       setError(`Delete failed: ${err.message}`);
       setLoading(prev => ({ ...prev, delete: false }));
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Delete Account</DialogTitle>
           <DialogDescription>Are you sure you want to delete your account? This action cannot be undone.</DialogDescription>
         </DialogHeader>
         <DialogFooter>
           <Button variant="destructive" onClick={handleDelete} disabled={loading.delete}>{loading.delete ? "Deleting..." : "Delete Account"}</Button>
           <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }
 