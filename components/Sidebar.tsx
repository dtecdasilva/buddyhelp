import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ChatModal from "./Chat2"; // Import ChatModal

function Sidebar({ isOpen, toggleSidebar, volunteerId }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        if (volunteerId) {
            setLoading(true);
            const chatsRef = collection(db, "chat");
            const q = query(chatsRef, where("volunteerId", "==", volunteerId));

            // Real-time listener
            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const fetchedChats = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    const latestChats = getLatestMessages(fetchedChats);
                    setChats(latestChats);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching chats:", error);
                    setLoading(false);
                }
            );

            return () => unsubscribe(); // Cleanup on unmount
        } else {
            setChats([]);
            setLoading(false);
        }
    }, [volunteerId]);

    const getLatestMessages = (chats) => {
        const groups = {};

        chats.forEach((chat) => {
            if (!groups[chat.senderId]) {
                groups[chat.senderId] = [];
            }
            groups[chat.senderId].push(chat);
        });

        return Object.keys(groups).map((userId) => {
            const userChats = groups[userId];
            userChats.sort(
                (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis() // Convert Firestore Timestamp to milliseconds
            );
            return {
                userId,
                latestMessage: userChats[0],
                messageCount: userChats.length,
            };
        });
    };

    return isOpen ? (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar}></div>
            <aside className="fixed inset-y-0 right-0 bg-gray-900 text-white shadow-lg w-80 p-6 z-50 transition-transform transform duration-300 ease-in-out">
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 right-4 text-red-500 text-xl hover:text-red-700 focus:outline-none"
                >
                    ✕
                </button>
                <h3 className="text-lg font-semibold mb-4">Chats</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : chats.length > 0 ? (
                    <ul className="space-y-4 mb-4">
                        {chats.map((chatData) => (
                            <li
                                key={chatData.latestMessage.id}
                                className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-all cursor-pointer"
                                onClick={() => setSelectedChat({ senderId: chatData.userId })}
                            >
                                <p>
                                    <strong>Message:</strong> {chatData.latestMessage.message}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No chats found for this volunteer.</p>
                )}
            </aside>

            {selectedChat && (
                <ChatModal
                    open={!!selectedChat}
                    onClose={() => setSelectedChat(null)}
                    volunteerId={volunteerId}
                    senderId={selectedChat?.senderId}
                    userId={volunteerId} // Assuming the current user is the volunteer
            />
            )}
        </>
    ) : null;
}

export default Sidebar;
