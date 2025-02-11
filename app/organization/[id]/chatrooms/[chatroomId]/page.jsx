"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import OrganizationSidebar from "@/app/components/OrganizationSidebar";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ChatroomPage = () => {
	const { id, chatroomId } = useParams();
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [chatroom, setChatroom] = useState(null);
	const [members, setMembers] = useState([]);
	const [showMemberList, setShowMemberList] = useState(false);
	const [filteredMembers, setFilteredMembers] = useState([]);
	const [sendingMessage, setSendingMessage] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Handle click outside to close member list
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (inputRef.current && !inputRef.current.contains(event.target)) {
				setShowMemberList(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fetch chatroom details
	useEffect(() => {
		const fetchChatroom = async () => {
			if (!id || !chatroomId) return;

			try {
				const response = await fetch(`/api/organization/${id}/chatrooms/${chatroomId}`);
				if (!response.ok) throw new Error("Failed to fetch chatroom details");
				const chatroomData = await response.json();
				setChatroom(chatroomData);
			} catch (error) {
				console.error("Error fetching chatroom details:", error);
			}
		};

		fetchChatroom();
	}, [id, chatroomId]);

	// Fetch members
	useEffect(() => {
		const fetchMembers = async () => {
			if (!id || !chatroomId) return;

			try {
				const response = await fetch(`/api/organization/${id}/chatrooms/${chatroomId}/members`);
				if (!response.ok) throw new Error("Failed to fetch members");
				const membersData = await response.json();
				console.log("Fetched members:", membersData);
				setMembers(membersData);
			} catch (error) {
				console.error("Error fetching members:", error);
			}
		};

		fetchMembers();
	}, [id, chatroomId]);

	// Fetch messages and set up real-time subscription
	useEffect(() => {
		if (!chatroomId) return;

		console.log("anon key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
		console.log("url:", process.env.NEXT_PUBLIC_SUPABASE_URL);


		const fetchMessages = async () => {
			try {
				 console.log("Fetching messages for chatroom:", chatroomId);
				 const { data, error } = await supabase
					  .from("Message")
					  .select("id, content, createdAt, sender:User(id, username)")
					  .eq("chatroomId", chatroomId)
					  .order("createdAt", { ascending: true });
	  
				 if (error) {
					  // Log the error details to better understand what went wrong
					  console.error("Error fetching messages from Supabase:", error);
					  throw error;
				 }
	  
				 if (!data || data.length === 0) {
					  console.warn("No messages found for this chatroom.");
				 } else {
					  console.log("Fetched messages:", data);
				 }
	  
				 setMessages(data || []);
			} catch (error) {
				 console.error("Error fetching messages:", error);
			} finally {
				 setLoading(false);
			}
	  };
	  


		const channel = supabase
			.channel(`messages-${chatroomId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "Message",
					filter: `chatroomId=eq.${chatroomId}`
				},
				async (payload) => {
					try {
						const { data: senderData, error } = await supabase
							.from("User")
							.select("id, username")
							.eq("id", payload.new.senderId)
							.single();

						if (error) throw error;

						const newMessage = {
							...payload.new,
							sender: senderData
						};

						setMessages(prev => [...prev, newMessage]);
					} catch (error) {
						console.error("Error handling real-time message:", error);
					}
				}
			)
			.subscribe();

		fetchMessages();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [chatroomId]);

	// Fetch current user
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch("/api/auth/user");
				if (!response.ok) throw new Error("Failed to fetch user");
				const userData = await response.json();
				setUser(userData);
			} catch (error) {
				console.error("Error fetching user:", error);
			}
		};

		fetchUser();
	}, []);

	const handleInputChange = (e) => {
		const value = e.target.value;
		setNewMessage(value);

		if (value.includes('@')) {
			const atIndex = value.lastIndexOf('@');
			const searchTerm = value.slice(atIndex + 1).toLowerCase();
			console.log("Searching for:", searchTerm);

			const filtered = members
				.filter(member =>
					member &&
					member.username &&
					member.username.toLowerCase().includes(searchTerm)
				);

			console.log("Filtered members:", filtered);
			setFilteredMembers(filtered);
			setShowMemberList(true);
		} else {
			setShowMemberList(false);
			setFilteredMembers([]);
		}
	};

	const handleMemberSelect = (username) => {
		const atIndex = newMessage.lastIndexOf('@');
		const newMessageWithTag = newMessage.slice(0, atIndex) + `@${username} `;
		setNewMessage(newMessageWithTag);
		setShowMemberList(false);
		inputRef.current?.focus();
	};

	const sendMessage = async () => {
		if (!newMessage.trim() || !user || sendingMessage) return;

		setSendingMessage(true);
		const messageId = uuidv4();
		const timestamp = new Date().toISOString();

		try {
			// Extract tagged usernames
			const taggedUsers = newMessage.match(/@(\w+)/g) || [];
			const usernames = taggedUsers.map(tag => tag.slice(1));

			// Send message
			const { error: messageError } = await supabase
				.from("Message")
				.insert([
					{
						id: messageId,
						chatroomId,
						senderId: user.id,
						content: newMessage,
						createdAt: timestamp,
					}
				]);

			if (messageError) throw messageError;

			// Create notifications for tagged users
			if (usernames.length > 0) {
				const { data: taggedUserData, error: userError } = await supabase
					.from("User")
					.select("id")
					.in("username", usernames);

				if (userError) throw userError;

				if (taggedUserData && taggedUserData.length > 0) {
					const notifications = taggedUserData.map(taggedUser => ({
						id: uuidv4(),
						userId: taggedUser.id,
						message: `${user.username} mentioned you in ${chatroom?.name || 'a chat'}`,
						isRead: false,
						createdAt: timestamp,
					}));

					const { error: notificationError } = await supabase
						.from("Notification")
						.insert(notifications);

					if (notificationError) throw notificationError;
				}
			}

			setNewMessage("");
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setSendingMessage(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<main className="flex items-center justify-center min-h-screen pt-[10vh] px-4 bg-gray-100">
			<div className="max-w-6xl flex md:flex-row flex-col w-full gap-6 p-">
				<OrganizationSidebar id={id} />

				<Card className="w-full md:w-4/5 shadow-lg border rounded-2xl p-2 bg-white">
					<CardHeader>
						<CardTitle className="text-2xl font-bold">
							{chatroom ? chatroom.name : "Loading..."}
						</CardTitle>
						{chatroom?.description && (
							<p className="text-gray-600">{chatroom.description}</p>
						)}
					</CardHeader>

					<CardContent className="flex flex-col max-h-96 min-h-96">
						<div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-100 mb-4">
							{loading ? (
								<p className="text-gray-500 text-center">Loading messages...</p>
							) : messages.length > 0 ? (
								messages.map((msg, index) => (
									<div
										key={`msg-${msg.id || index}-${msg.createdAt || Date.now()}`}
										className={`mb-2 p-2 rounded-lg w-fit min-w-24 ${msg.sender?.id === user?.id
												? 'bg-blue-100 ml-auto max-w-[80%] text-right'
												: 'bg-white max-w-[80%]'
											}`}
									>
										<div className="font-semibold text-sm text-gray-700">
											{msg.sender?.username || "Unknown"}
										</div>
										<div className="whitespace-pre-wrap break-words">
											{msg.content}
										</div>
									</div>
								))
							) : (
								<p className="text-gray-500 text-center">
									No messages yet. Start the conversation!
								</p>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className="relative" ref={inputRef}>
							<Input
								value={newMessage}
								onChange={handleInputChange}
								onKeyPress={handleKeyPress}
								placeholder="Type a message... (Use @ to mention someone)"
								className="w-full pr-20"
								disabled={sendingMessage}
							/>

							{showMemberList && (
								<div className="absolute bottom-full left-0 w-full bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mb-1">
									{filteredMembers.length > 0 ? (
										filteredMembers.map((member) => (
											<div
												key={`member-${member.id || member.username}`}
												className="p-2 hover:bg-gray-100 cursor-pointer"
												onClick={() => handleMemberSelect(member.username)}
											>
												{member.username}
											</div>
										))
									) : (
										<div className="p-2 text-gray-500 text-center">
											No matching users found
										</div>
									)}
								</div>
							)}

							<Button
								onClick={sendMessage}
								disabled={!newMessage.trim() || sendingMessage}
								className="absolute right-2 top-1/2 transform -translate-y-1/2"
							>
								{sendingMessage ? "..." : "Send"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
};

export default ChatroomPage;