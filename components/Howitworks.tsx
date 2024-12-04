import React from 'react';
import { FiMessageSquare, FiUserCheck, FiPhone } from 'react-icons/fi'; // Importing icons from React Icons

function HowItWorks() {
  const steps = [
    { id: 1, title: "Match with a Listener", Icon: FiUserCheck },
    { id: 2, title: "Start A Chat", Icon: FiMessageSquare },
    { id: 3, title: "Talk to Your Listener", Icon: FiPhone }
  ];

  return (
    <section className="flex flex-col items-center justify-center py-12 bg-gray-100" id='howitworks'>
      <h2 className="text-3xl font-bold mb-8">HOW IT WORKS</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center bg-white p-6 shadow-md rounded-lg space-x-4"
          >
            <div className="p-4 bg-gray-200 rounded-lg">
              <step.Icon className="text-yellow-500 w-12 h-12" />
            </div>
            <p className="text-lg font-medium">{step.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
