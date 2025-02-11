"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ContactDetailsModal = ({ isOpen, onClose, contact }) => {
  // If no contact is provided, render nothing
  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>

        {/* Display Contact Information */}
        <div className="space-y-4">
          <p>
            <strong>Name:</strong> {contact.name}
          </p>
          <p>
            <strong>Email:</strong> {contact.email || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {contact.phone || "N/A"}
          </p>
          <p>
            <strong>Position:</strong> {contact.position || "N/A"}
          </p>
          <p>
            <strong>Company:</strong> {contact.company || "N/A"}
          </p>
          <p>
            <strong>Notes:</strong> {contact.notes || "N/A"}
          </p>
        </div>

        {/* Footer with Close Button */}
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsModal;