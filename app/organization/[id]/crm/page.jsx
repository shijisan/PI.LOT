"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import OrganizationSidebar from "@/app/components/OrganizationSidebar";
import CreateContactModal from "@/app/components/CreateContactModal"; // ✅ Import modal for creating contacts
import EditContactModal from "@/app/components/EditContactModal"; // ✅ Import modal for editing contacts
import ContactDetailsModal from "@/app/components/ContactDetailsModal"; // ✅ Import modal for contact details
import DeleteContactModal from "@/app/components/DeleteContactModal"; // ✅ Import delete confirmation modal

const CRM = () => {
  const { id } = useParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // ✅ State for contact details modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // ✅ State for delete confirmation modal
  const [selectedContact, setSelectedContact] = useState(null);
  const [userRole, setUserRole] = useState(null); // ✅ State to store the user's role

  useEffect(() => {
    const fetchUserDataAndContacts = async () => {
      try {
        // Fetch the user's role in the organization
        const userRes = await fetch(`/api/organization/${id}/role`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!userRes.ok) throw new Error("Failed to fetch user role");
        const userData = await userRes.json();
        setUserRole(userData.role);

        // Fetch all contacts for the organization
        const contactsRes = await fetch(`/api/organization/${id}/crm`);
        if (!contactsRes.ok) throw new Error("Failed to fetch contacts");
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndContacts();
  }, [id]);

  const handleContactCreated = (newContact) => {
    setContacts((prev) => [newContact, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleContactUpdated = (updatedContact) => {
    setContacts((prev) =>
      prev.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact))
    );
    setIsEditModalOpen(false);
  };

  const handleContactDeleted = (contactId) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(`/api/organization/${id}/crm/${selectedContact.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        handleContactDeleted(selectedContact.id); // Remove the contact from the state
        setIsDeleteModalOpen(false); // Close the modal
      } else {
        console.error("Failed to delete contact");
        alert("Failed to delete contact. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("An error occurred while deleting the contact.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl flex md:flex-row flex-col w-full gap-6">
        {/* Sidebar Navigation */}
        <OrganizationSidebar id={id} />

        {/* Contacts Content */}
        <Card className="w-full md:w-4/5 shadow-lg border rounded-2xl p-6 bg-white">
          <CardHeader>
            <div className="flex flex-row justify-between items-center">
              <CardTitle className="text-2xl font-bold">CRM</CardTitle>
              {/* Show "Create Contact" button only for OWNER or MODERATOR */}
              {(userRole === "OWNER" || userRole === "MODERATOR") && (
                <Button onClick={() => setIsCreateModalOpen(true)} variant="secondary">
                  Create Contact
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex justify-between items-center border-b py-2 cursor-pointer"
                    onClick={() => {
                      setSelectedContact(contact); // Set the selected contact
                      setIsDetailsModalOpen(true); // Open the details modal
                    }}
                  >
                    <div>
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email || "No email"}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent click
                          setSelectedContact(contact);
                          setIsEditModalOpen(true);
                        }}
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent click
                          setSelectedContact(contact);
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
              <p className="text-gray-500">No contacts available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={id}
        onContactCreated={handleContactCreated}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contact={selectedContact}
        organizationId={id}
        onContactUpdated={handleContactUpdated}
      />

      {/* Contact Details Modal */}
      <ContactDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        contact={selectedContact}
      />

      {/* Delete Contact Modal */}
      <DeleteContactModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteContact} // Pass the delete handler to the modal
      />
    </main>
  );
};

export default CRM;