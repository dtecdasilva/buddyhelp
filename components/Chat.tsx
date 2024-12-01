import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// Message type definition
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
}

const Chat: React.FC<ChatModalProps> = ({ open, onOpenChange, volunteerId }) => {
  const [token] = useState(() => {
    let userId = Cookies.get("anonymousUserId");
    if (!userId) {
      userId = uuidv4();
      Cookies.set("anonymousUserId", userId, { expires: 365 });
    }
    return userId;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (input.trim()) {
      const tempMessage: Message = {
        message: input,
        senderId: token,
        volunteerId,
        timestamp: Timestamp.now(),
      };

      // Temporary display before confirming with Firestore
      setMessages((prev) => [...prev, tempMessage]);
      setInput("");

      try {
        await addDoc(collection(db, "chat"), {
          message: input,
          senderId: token,
          volunteerId,
          timestamp: Timestamp.now(),
        });
      } catch (error) {
        console.error("Error sending message to Firestore:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (volunteerId && token) {
      const q = query(
        collection(db, "chat"),
        where("volunteerId", "in", [volunteerId, token]),
        where("senderId", "in", [volunteerId, token]),
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
  }, [volunteerId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[400px] sm:w-[500px] p-6 z-[9999] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-black">
              Chat with Volunteer
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="text-black font-bold text-xl hover:bg-gray-200 rounded-full p-1"
            >
              X
            </button>
          </div>
          <div className="flex flex-col h-[500px]">
            <div className="flex-grow overflow-y-auto p-4 bg-gray-100 rounded">
              {messages.map((messageObj, index) => (
                <div
                  key={messageObj.id || index}
                  className={`mb-4 flex ${
                    messageObj.senderId === token ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      messageObj.senderId === token
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    } p-3 rounded max-w-xs`}
                  >
                    <p>{messageObj.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        messageObj.senderId === token
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {messageObj.timestamp
                        ? messageObj.timestamp.toDate().toLocaleString()
                        : "Sending..."}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-grow border rounded p-2 mr-2"
              />
              <Button
                variant="default"
                className="bg-blue-500 text-white"
                onClick={handleSend}
              >
                Send
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Chat;
