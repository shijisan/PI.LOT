import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const OrganizationCard = ({ user, onOrganizationCreate }) => {
	const [organizations, setOrganizations] = useState([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [orgName, setOrgName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Fetch organizations when the component mounts
	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				const res = await fetch("/api/organizations");
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Failed to fetch organizations");
				}
				setOrganizations(data.organizations || []);
			} catch (err) {
				setError(err.message);
			}
		};
		fetchOrganizations();
	}, []);

	const handleCreateOrg = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/organizations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: orgName }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to create organization");
			}

			setIsCreateModalOpen(false);
			setOrgName("");

			// Add new organization to the list
			setOrganizations((prevOrgs) => Array.isArray(prevOrgs) ? [...prevOrgs, data.organization] : [data.organization]);

			// Notify parent component if callback provided
			if (onOrganizationCreate) {
				onOrganizationCreate(data.organization);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const closeModal = () => {
		setIsCreateModalOpen(false);
		setError("");
		setOrgName("");
	};

	return (
		<Card className="w-full max-h-96 p-4">
			<div className="flex flex-row justify-between items-center px-6 mb-4">
				<CardHeader className="p-0">
					<CardTitle className="text-2xl">Organizations</CardTitle>
				</CardHeader>
				<Button onClick={() => setIsCreateModalOpen(true)}>
					Create Organization
				</Button>
			</div>

			<CardContent>
				{organizations?.length ? (
					organizations.map((org) => (
						<Link key={org.id} href={`/organization/${org.id}`} passHref>
							<div className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
								<h3 className="font-semibold">{org.name}</h3>
								<p className="text-gray-600">
									Role: {org.members.find((m) => m.userId === user.id)?.role || "Owner"}
								</p>
							</div>
						</Link>
					))
				) : (
					<p className="text-gray-500 text-center">No organizations found</p>
				)}
			</CardContent>

			<Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Organization</DialogTitle>
						<DialogDescription>
							Create a new organization. You will be the owner.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateOrg}>
						<div className="space-y-4">
							<div>
								<label htmlFor="orgName" className="block text-sm font-medium mb-1">
									Organization Name
								</label>
								<Input
									id="orgName"
									value={orgName}
									onChange={(e) => setOrgName(e.target.value)}
									placeholder="Enter organization name"
									required
								/>
							</div>
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
						</div>
						<DialogFooter className="mt-4">
							<Button
								type="button"
								variant="secondary"
								onClick={closeModal}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={loading}>
								{loading ? "Creating..." : "Create Organization"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</Card>
	);
};

export default OrganizationCard;
