import React, { useEffect, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { Button } from "./ui/button";

function ChatModal({ open, onClose, volunteerId, senderId, userId }) {
    const [messages, setMessages] = useState([]); // State to store messages
    const [newMessage, setNewMessage] = useState(""); // To track the new message input
    const messagesEndRef = useRef(null); // Ref to the end of the messages list

    // Fetch messages from the Firestore
    useEffect(() => {
        if (volunteerId && senderId) {
            const q = query(
                collection(db, "chat"),
                where("volunteerId", "in", [volunteerId, senderId]),
                where("senderId", "in", [volunteerId, senderId]),
                orderBy("timestamp", "asc")
            );

            // Real-time listener for messages
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const allMessages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMessages(allMessages);
            });

            return () => unsubscribe();
        }
    }, [volunteerId, senderId]);

    // Scroll to the latest message when the messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Scroll to the bottom when the modal opens
    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [open]);

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (newMessage.trim() !== "") {
            try {
                await addDoc(collection(db, "chat"), {
                    volunteerId: senderId, // Set the senderId as volunteerId
                    senderId: volunteerId, // Set the volunteerId as senderId
                    message: newMessage,
                    timestamp: serverTimestamp(),
                });
                setNewMessage(""); // Clear the input field after sending the message
            } catch (error) {
                console.error("Error sending message: ", error);
            }
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[400px] sm:w-[500px] p-6 z-[9999] max-h-[90vh] overflow-y-auto">
                    {/* Title with X button */}
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-semibold text-black">
                            Chat with Sender
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-black font-bold text-xl hover:bg-gray-200 rounded-full p-1"
                        >
                            X
                        </button>
                    </div>

                    {/* Messages */}
                    {messages.length > 0 ? (
                        <ul className="space-y-4 mb-4 mt-4 max-h-[300px] overflow-y-auto">
                            {messages.map((msg) => {
                                const isSender = msg.senderId === userId;
                                const messageAlignment = isSender ? "justify-end" : "justify-start";
                                const messageBg = isSender ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800";
                                const dateTextColor = isSender ? "text-white" : "text-gray-500";
                                
                                return (
                                    <li key={msg.id} className={`flex ${messageAlignment}`}>
                                        <div className={`${messageBg} max-w-[70%] p-4 rounded-lg shadow-md break-words`}>
                                            <p>{msg.message}</p>
                                            <p className={`text-xs mt-1 ${dateTextColor}`}>
                                                {msg.timestamp
                                                    ? new Date(msg.timestamp.toDate()).toLocaleString()
                                                    : "Sending..."}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>No messages found.</p>
                    )}

                    {/* Input field for replying */}
                    <div className="mt-4 flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow border rounded p-2 mr-2"
                        />
                        <Button
                            variant="default"
                            className="bg-blue-500 text-white"
                            onClick={handleSendMessage}
                        >
                            Send
                        </Button>
                    </div>

                    {/* Reference to the bottom of the messages list */}
                    <div ref={messagesEndRef} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default ChatModal;
