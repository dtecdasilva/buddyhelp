'use client'
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

function Faq() {
  const faqs = [
    { id: 1, question: "What is BuddyHelp?", answer: "BuddyHelp is a platform that connects people with listeners for support." },
    { id: 2, question: "How does it work?", answer: "You start a chat, get matched with a listener, and talk to your listener." },
    { id: 3, question: "Is it free?", answer: "Yes, BuddyHelp offers free support." },
    { id: 4, question: "Who are the listeners?", answer: "Listeners are trained individuals providing emotional support." },
    { id: 5, question: "How do I start?", answer: "Simply click 'Start Chat' and follow the steps." },
    { id: 6, question: "Can I remain anonymous?", answer: "Yes, you can remain anonymous during your chat sessions." },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null); // Specify type here

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="flex flex-col items-center justify-center py-12">
      <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
      <div className="w-full max-w-2xl">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-300 rounded-lg mb-4"
          >
            <button
              className="w-full flex justify-between items-center p-4 bg-white text-left text-lg font-medium"
              onClick={() => toggleFaq(faq.id)}
            >
              {faq.question}
              {openFaq === faq.id ? (
                <FiChevronUp className="w-6 h-6" />
              ) : (
                <FiChevronDown className="w-6 h-6" />
              )}
            </button>
            {openFaq === faq.id && (
              <div className="p-4 bg-gray-100 text-gray-700">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Faq;
