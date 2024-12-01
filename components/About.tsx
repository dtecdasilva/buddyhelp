import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Check } from "lucide-react";

function About() {
  const services = [
    "Individual Therapy",
    "Group Counseling",
    "Mindfulness & Meditation",
    "Stress Management",
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Main section with image and text */}
      <h2 className="text-3xl font-bold mb-12 text-center">ABOUT BUDDY HELP</h2>
      <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
        {/* Animated Image */}
        <div className="w-full md:w-1/2 animate-slide-in-left">
          <Image
            src="/human.jpg"
            alt="Hero image"
            layout="responsive"
            width={400} // Set width based on the aspect ratio of your image
            height={600} // Adjust height to maintain aspect ratio
            className="rounded"
          />
        </div>
        {/* Animated About Section */}
        <div className="w-full md:w-1/2 animate-slide-in-right">
          <p className="text-gray-700"></p>
          At Buddy Help, we understand the importance of mental health and the power of human connection. Our mission is to make emotional support accessible to everyone, anytime, and anywhere. Whether you're looking for someone to talk to or just need a quick chat to feel heard, Buddy Help is here to be your supportive companion.
          Join our community today, and let us work together towards better mental well-being!
            <div className="space-y-4 p-6 rounded-lg max-w-md">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {/* Check Icon */}
                  <span className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full">
                    <Check className="w-4 h-4" />
                  </span>
                  {/* Service Name */}
                  <span className="text-black text-lg">{service}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* Animated Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-slide-in-bottom">
          <CardHeader>
            <CardTitle>91% of users</CardTitle>
            <CardDescription>feel meaningfully better after talking to a listener</CardDescription>
          </CardHeader>
        </Card>
        <Card className="animate-slide-in-bottom">
          <CardHeader>
            <CardTitle>79% of people</CardTitle>
            <CardDescription>
              believe listeners are able to help people with mental health struggles
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="animate-slide-in-bottom">
          <CardHeader>
            <CardTitle>80% of users</CardTitle>
            <CardDescription>indicated that they would happily recommend it to others</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default About;
