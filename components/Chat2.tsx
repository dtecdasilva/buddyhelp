import React, { useEffect, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp } from "firebase/firestore";
import { Button } from "./ui/button";

interface Message {
    id: string;
    message: string;
    senderId: string;
    timestamp: Timestamp;
}

interface ChatModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  volunteerId: string;
  senderId: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose, volunteerId, senderId}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
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
          ...doc.data(),
        })) as Message[];
        setMessages(allMessages);
      });

      return () => unsubscribe();
    }
  }, [volunteerId, senderId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      try {
        await addDoc(collection(db, "chat"), {
          volunteerId: senderId,
          senderId: volunteerId,
          message: newMessage,
          timestamp: serverTimestamp(),
        });
        setNewMessage("");
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
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-black">
              Chat with Sender
            </Dialog.Title>
            <button onClick={() => onClose(false)} className="text-black font-bold text-xl hover:bg-gray-200 rounded-full p-1">
              X
            </button>
          </div>
          <div>
            {messages.map((msg) => (
              <div key={msg.id}>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <Button onClick={handleSendMessage}>Send</Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ChatModal;
