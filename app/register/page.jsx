"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
	const router = useRouter();
	const [form, setForm] = useState({ username: "", email: "", password: "" });
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		const res = await fetch("/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});

		if (!res.ok) {
			const data = await res.json();
			setError(data.error || "Registration failed");
			return;
		}

		router.push("/login");
	};

	return (
		<main className="flex justify-center items-center min-h-screen bg-gray-100">
			<Card className="w-full max-w-md p-4">
				<CardHeader>
					<CardTitle className="text-center text-2xl">Register</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<Label htmlFor="username">Username</Label>
							<Input id="username" type="text" placeholder="Your Username" required onChange={handleChange} />
						</div>
						<div>
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="you@example.com" required onChange={handleChange} />
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" placeholder="••••••••" required onChange={handleChange} />
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<Button className="w-full" type="submit">Sign Up</Button>
					</form>
					<p className="text-sm text-gray-600 mt-4 text-center">
						Already have an account?{" "}
						<span className="text-blue-600 cursor-pointer hover:underline" onClick={() => router.push("/login")}>
							Login
						</span>
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
