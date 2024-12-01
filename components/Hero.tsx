'use client'
import React, { useState } from "react";
import Image from "next/image";
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
import { v4 as uuidv4 } from 'uuid'; // Ensure you import uuidv4
import { FiMessageSquare, FiUserCheck } from "react-icons/fi";

function Hero() {
  const [isOpen, setIsOpen] = useState(false); // For controlling the dialog state
  const [matchedUserEmail, setMatchedUserEmail] = useState(null);
  const [matchedUserId, setMatchedUserId] = useState(null);
  const [formData, setFormData] = useState({
    age: "",
    country: "",
    gender: "",
  });
  const [showForm, setShowForm] = useState(false); // Whether to show the age/gender/country form
  const [,setLoading] = useState(false); // Define loading state for managing loading state
  const [senderId, ] = useState(() => {
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Function to perform the query with dynamic conditions
      const usersRef = collection(db, "users");
  const findMatch = async (conditions) => {
  const q = query(usersRef, ...conditions.map((c) => where(c.field, "==", c.value)));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
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
      console.error("Error searching for matching users:", error.message);
    }
  };

  return (
    <section className="relative flex items-center justify-between px-20 py-20 mt-8 mx-10 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
      {/* Background Video */}
      <video className="absolute top-0 left-0 w-full h-full object-cover opacity-20" src="/hero.mp4" autoPlay loop muted playsInline />

      {/* Content */}
      <div className="relative z-10 max-w-lg space-y-6">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight leading-tight">
          The BuddyHelp Platform
        </h1>
        <p className="text-lg opacity-90">
          Offering emotional support and mental well-being through accessible and anonymous chats.
        </p>

        <div className="flex space-x-4 mt-10">
          <Button onClick={handleChatClick} className="flex items-center bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:shadow-lg px-6 py-4 rounded-lg text-white transition-transform transform hover:scale-105">
            <FiMessageSquare className="mr-2" size={24} /> Chat with a Volunteer Listener
          </Button>
          <Button className="flex items-center border border-white text-white px-6 py-4 rounded-lg hover:bg-white hover:text-black transition-transform transform hover:scale-105">
            <FiUserCheck className="mr-2" size={24} /> Get Matched with a Counselor
          </Button>
        </div>
      </div>

      {/* Dialog for Form or Chat */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        {showForm ? (
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="p-6 bg-white text-black rounded-lg shadow-xl w-[400px]">
              <Dialog.Title className="text-2xl font-bold mb-4 text-center">Match with the Right Volunteer</Dialog.Title>
              <form onSubmit={handleSubmit}>
                <label className="block mb-2">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full p-3 mb-4 border rounded-lg" />
                <label className="block mb-2">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full p-3 mb-4 border rounded-lg" />
                <label className="block mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-3 mb-4 border rounded-lg">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex justify-between">
                  <Dialog.Close asChild>
                    <button type="button" className="bg-gray-300 py-2 px-6 rounded-lg">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700">Next</button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        ) : (
          <Chat open={isOpen} onOpenChange={setIsOpen} email={matchedUserEmail} volunteerId={matchedUserId} />
        )}
      </Dialog.Root>

      {/* Right Image */}
      <div className="relative z-10 w-[350px] mt-8 -ml-10 lg:mt-16 lg:-ml-5">
        <Image
          src="/Untitled-2.png"
          alt="Hero image"
          width={400}
          height={500}
          className="rounded-lg shadow-2xl transform transition-transform hover:scale-105"
        />
      </div>
    </section>
  );
}

export default Hero;
