'use client'
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Chat from "./Chat";
import * as Dialog from "@radix-ui/react-dialog";
import { db } from "../firebase"; // Your Firestore config
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"; // Firestore queries
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid"; // Ensure you import uuidv4
import { FiMessageSquare, FiUserCheck } from "react-icons/fi";
import Image from "next/legacy/image";

// Define a type for the conditions used in findMatch
type Condition = { field: string; value: string | number };

function Hero() {
  const [isOpen, setIsOpen] = useState(false); // For controlling the dialog state
  const [, setMatchedUserEmail] = useState<string | null>(null);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    age: "",
    country: "",
    gender: "",
  });
  const [showForm, setShowForm] = useState(false); // Whether to show the age/gender/country form
  const [, setLoading] = useState(false); // Define loading state for managing loading state
  const [senderId] = useState(() => {
    let userId = Cookies.get("anonymousUserId");
    if (!userId) {
      userId = uuidv4();
      Cookies.set("anonymousUserId", userId, { expires: 365 });
    }
    return userId;
  });

  // Check for existing chat
  const handleChatClick = async () => {
    setLoading(true); // Start loading state
    try {
      const chatRef = collection(db, "chat");
      const q = query(
        chatRef,
        where("senderId", "==", senderId),
        where("volunteerId", "!=", null) // Ensure there’s a matching volunteer
      );

      const chatSnapshot = await getDocs(q);

      if (!chatSnapshot.empty) {
        const existingChat = chatSnapshot.docs[0].data();
        console.log("Existing chat found:", existingChat); // Log for debugging
        setMatchedUserEmail(existingChat.volunteerEmail); // Assuming email is stored
        setMatchedUserId(existingChat.volunteerId);
        setIsOpen(true); // Open chat modal
      } else {
        console.log("No existing chat found. Showing the form.");
        setShowForm(true); // No existing chat, show the form
        setIsOpen(true); // Open dialog for form
      }
    } catch (error) {
      console.error("Error in handleChatClick:", error);
      alert("An error occurred while checking for existing chats. Please try again.");
    } finally {
      setLoading(false); // Stop loading state after operation completes
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Function to perform the query with dynamic conditions
      const usersRef = collection(db, "users");
      const findMatch = async (conditions: Condition[]) => {
        const q = query(
          usersRef,
          ...conditions.map((c) => where(c.field, "==", c.value))
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
        }
        return [];
      };

      let bestMatch = null;
      let matchedUserId = null;

      // 1. Try matching all three inputs
      let results = await findMatch([
        { field: "age", value: formData.age },
        { field: "country", value: formData.country },
        { field: "gender", value: formData.gender },
      ]);

      // 2. If no match, try matching any two inputs
      if (results.length === 0) {
        results = await findMatch([
          { field: "age", value: formData.age },
          { field: "country", value: formData.country },
        ]);

        if (results.length === 0) {
          results = await findMatch([
            { field: "age", value: formData.age },
            { field: "gender", value: formData.gender },
          ]);
        }

        if (results.length === 0) {
          results = await findMatch([
            { field: "country", value: formData.country },
            { field: "gender", value: formData.gender },
          ]);
        }
      }

      // 3. If no match, try matching at least one input
      if (results.length === 0) {
        results = await findMatch([{ field: "age", value: formData.age }]);

        if (results.length === 0) {
          results = await findMatch([{ field: "country", value: formData.country }]);
        }

        if (results.length === 0) {
          results = await findMatch([{ field: "gender", value: formData.gender }]);
        }
      }

      // 4. If no match, get any user
      if (results.length === 0) {
        const fallbackQuerySnapshot = await getDocs(usersRef);
        results = fallbackQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
      }

      // Select the first matching user
      if (results.length > 0) {
        bestMatch = results[0].data;
        matchedUserId = results[0].id;
      }

      if (bestMatch) {
        setMatchedUserEmail(bestMatch.email);
        setMatchedUserId(matchedUserId);
        setShowForm(false); // Hide the form
        setIsOpen(true); // Open chat modal
      } else {
        alert("No matching volunteers found. Please try again.");
      }
    } catch (error) {
      console.error("Error searching for matching users:", error);
    }
  };

  return (
    <section className="relative flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-10 lg:px-20 py-10 md:py-16 lg:py-20 mt-16 sm:mt-32 md:mt-8 mx-4 md:mx-8 lg:mx-10 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
    {/* Background Video */}
    <video className="absolute top-0 left-0 w-full h-full object-cover opacity-20" src="/hero.mp4" autoPlay loop muted playsInline />
  
    {/* Content */}
    <div className="relative z-10 max-w-full md:max-w-lg space-y-4 md:space-y-6 text-center md:text-left">
      <h1 className="text-4xl sm:text-5xl sm:pt-10 lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
        The BuddyHelp Platform
      </h1>
      <p className="text-base sm:text-lg opacity-90">
        Offering emotional support and mental well-being through accessible and anonymous chats.
      </p>
  
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-6 md:mt-10 justify-center md:justify-start">
        <Button
          onClick={handleChatClick}
          className="flex items-center bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:shadow-lg px-6 py-3 sm:py-4 rounded-lg text-white transition-transform transform hover:scale-105 text-sm sm:text-base"
        >
          <FiMessageSquare className="mr-2" size={20} /> Chat with a Volunteer Listener
        </Button>
        <Button className="flex items-center border border-white text-white px-6 py-3 sm:py-4 rounded-lg hover:bg-white hover:text-black transition-transform transform hover:scale-105 text-sm sm:text-base">
          <FiUserCheck className="mr-2" size={20} /> Get Matched with a Counselor
        </Button>
      </div>
    </div>
  
  

      {/* Dialog for Form or Chat */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        {showForm ? (
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="p-6 bg-white text-black rounded-lg shadow-xl w-[400px]">
              <Dialog.Title className="text-2xl font-bold mb-4 text-center">
                Match with the Right Volunteer
              </Dialog.Title>
              <form onSubmit={handleSubmit}>
                <label className="block mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-3 mb-4 border rounded-lg"
                />
                <label className="block mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-3 mb-4 border rounded-lg"
                />
                <label className="block mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 mb-4 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <Button type="submit" className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg">
                  Find Volunteer
                </Button>
              </form>
            </div>
          </Dialog.Content>
        ) : (
          <Chat volunteerId={matchedUserId || "defaultId"} open={isOpen} onOpenChange={setIsOpen} />
        )}
      </Dialog.Root>
      <div className="relative z-10 w-3/4 md:w-1/2 lg:w-[350px] mt-8 md:mt-0 lg:mt-16 -ml-5 md:ml-0 lg:-ml-5 hidden sm:flex justify-center">
        <Image
          src="/Untitled-2.png"
          alt="Hero image"
          width={400}
          height={500}
          className="rounded-lg shadow-2xl transform transition-transform hover:scale-105 max-w-full h-auto"
        />
      </div>
    </section>
  );
}

export default Hero;
