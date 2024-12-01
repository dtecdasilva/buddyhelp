'use server'

import { adminDb } from "firebase-admin";
import { auth } from "@clerk/nextjs/server"

export async function createNewText(text: string) {
    // Protect the route by requiring authentication
    auth.protect();

    // Retrieve session claims (user details) from Clerk
    const { sessionClaims } = await auth();

    // Reference the "chat" collection
    const docCollectionRef = adminDb.collection("chat");

    // Create a new document in the "chat" collection with the provided text
    const docRef = await docCollectionRef.add({
        text: text, // Store the new text in the document
        createdAt: new Date() // Store the creation timestamp
    });

    // Return the ID of the created document
    return { docId: docRef.id };
}
