"use client";
import { use, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import OrganizationSidebar from "@/app/components/OrganizationSidebar";
import { Button } from "@/components/ui/button";
import ManageUsersModal from "@/app/components/ManageUsersModal";

const OrganizationPage = ({ params }) => {
   const { id } = use(params); // ✅ FIXED: Unwrap `params` with `use()`

   const [organization, setOrganization] = useState(null);
   const [userRole, setUserRole] = useState(null);
   const [error, setError] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   useEffect(() => {
      const fetchOrganization = async () => {
         try {
            const response = await fetch(`/api/organization/${id}`);
            if (!response.ok) throw new Error("Failed to fetch organization details");
            const data = await response.json();
            setOrganization(data);
         } catch (err) {
            setError(err.message);
         }
      };

      const fetchUserRole = async () => {
         try {
            const response = await fetch(`/api/organization/${id}/role`);
            if (!response.ok) throw new Error("Failed to fetch user role");
            const data = await response.json();
            setUserRole(data.role);
         } catch (err) {
            setError(err.message);
         }
      };

      fetchOrganization();
      fetchUserRole();
   }, [id]);

   if (error) {
      return (
         <div className="flex items-center justify-center h-screen">
            <p className="text-red-500 text-lg font-semibold">{error}</p>
         </div>
      );
   }

   return (
      <main className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
         <div className="max-w-6xl flex md:flex-row flex-col w-full gap-6">
            {/* Sidebar Navigation */}
            <OrganizationSidebar id={id} />

            {/* Organization Details */}
            <Card className="w-full md:w-4/5 shadow-lg border rounded-2xl p-6 bg-white">
               <CardHeader>
                  <div className="flex flex-row justify-between items-center">
                     {organization ? (
                        <CardTitle className="text-2xl font-bold">{organization.name}</CardTitle>
                     ) : (
                        <Skeleton className="h-6 w-40 mb-4" />
                     )}
                     {(userRole === "OWNER" || userRole === "MODERATOR") && (
                        <Button onClick={() => setIsModalOpen(true)}>Manage Users</Button>
                     )}
                  </div>
               </CardHeader>

               <CardContent>
                  {organization ? (
                     <>
                        <p className="text-gray-700">
                           <strong>Owner:</strong> {organization.owner.username}
                        </p>
                        <p className="text-gray-700">
                           <strong>Created at:</strong> {new Date(organization.createdAt).toLocaleDateString()}
                        </p>

                        <h3 className="mt-6 text-lg font-semibold">Members:</h3>
                        <ul className="mt-2 space-y-2">
                           {organization.members.length > 0 ? (
                              organization.members.map((member) => (
                                 <li
                                    key={member.userId}
                                    className="bg-gray-50 border rounded-lg p-2 text-gray-600"
                                 >
                                    {member.role ? `${member.role} - User ID: ${member.userId}` : `Owner - User ID: ${member.userId}`}
                                 </li>
                              ))
                           ) : (
                              <p className="text-gray-500">No members found</p>
                           )}
                        </ul>
                     </>
                  ) : (
                     <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                     </div>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Manage Users Modal */}
         {isModalOpen && (
            <ManageUsersModal
               isOpen={isModalOpen}
               onClose={() => setIsModalOpen(false)}
               organizationId={id}
            />
         )}
      </main>
   );
};

export default OrganizationPage;
