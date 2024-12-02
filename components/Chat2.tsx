import React, { useEffect, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp } from "firebase/firestore";
import { Button } from "./ui/button";

interface Message {
  id?: string;
  message: string;
  senderId: string;
  volunteerId?: string;
  timestamp?: Timestamp;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerId?: string;
  senderId?: string;
  userId?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onOpenChange, volunteerId, senderId, userId  }) => {
  const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState(""); // Input state
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (volunteerId && senderId) {
            const q = query(
                collection(db, "chat"),
                where("volunteerId", "in", [volunteerId, senderId]),
                where("senderId", "in", [volunteerId, senderId]),
                orderBy("timestamp", "asc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
              const allMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Message),
              }));
              setMessages(allMessages);
            });

            return () => unsubscribe();
        }
    }, [volunteerId, senderId]);

    useEffect(() => {
      console.log("messagesEndRef:", messagesEndRef.current);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);
  

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            try {
                await addDoc(collection(db, "chat"), {
                    volunteerId: senderId,
                    senderId: volunteerId,
                    message: newMessage,
                    timestamp: serverTimestamp(),
                });
                setNewMessage("");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSendMessage();
      }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[400px] sm:w-[500px] p-6 z-[9999] max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-semibold text-black">Chat with Sender</Dialog.Title>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-black font-bold text-xl hover:bg-gray-200 rounded-full p-1"
                        >
                            ✕
                        </button>
                    </div>
                    {messages.length > 0 ? (
                        <ul className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                            {messages.map((messageObj) => (
                                <li key={messageObj.id} className={`flex ${messageObj.senderId === userId ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`${
                                          messageObj.senderId === userId
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-800"
                                        } max-w-[70%] p-4 rounded-lg shadow-md break-words`}
                                    >
                                        <p>{messageObj.message}</p>
                                        <p
                                            className={`text-xs mt-1 ${
                                              messageObj.senderId === userId ? "text-white" : "text-gray-500"
                                            }`}
                                        >
                                            {messageObj.timestamp
                                                ? new Date(messageObj.timestamp.toDate()).toLocaleString()
                                                : "Sending..."}
                                        </p>
                                    </div>
                                </li>
                            ))}
                            <div ref={messagesEndRef} />
                        </ul>
                    ) : (
                        <p>No messages found.</p>
                    )}
                    <div className="mt-4 flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-grow border rounded p-2 mr-2"
                        />
                        <Button variant="default" className="bg-blue-500 text-white" onClick={handleSendMessage}>
                            Send
                        </Button>
                    </div>
                    <div ref={messagesEndRef} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ChatModal;
