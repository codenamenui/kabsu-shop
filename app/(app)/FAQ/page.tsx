"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string | React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-semibold transition-colors hover:text-emerald-700"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="text-emerald-800" /> : <ChevronDown />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm leading-relaxed text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};

const MerchandiseFAQs = () => {
  const faqData = [
    {
      question: "How do I order merchandise for my student organization?",
      answer:
        "To place an order, follow these steps:\n1. Create an account with your official college email\n2. Select your organization from the dropdown\n3. Choose your desired items and quantities\n4. Submit for organization approval\n5. Complete payment once approved",
    },
    {
      question: "What types of merchandise can student organizations purchase?",
      answer:
        "We offer a wide range of merchandise including:\n• Custom t-shirts and hoodies\n• Branded water bottles\n• Tote bags\n• Event banners and posters\n• Custom printed stickers\n• Promotional giveaway items\n• Organization-specific apparel",
    },
    {
      question: "How long does merchandise production take?",
      answer:
        "Standard production times are:\n• Basic items (t-shirts, stickers): 5-7 business days\n• Custom printed items: 7-10 business days\n• Large bulk orders: 10-14 business days\n\nRush orders are available for an additional fee.",
    },
    {
      question: "Are there minimum order quantities?",
      answer:
        "Minimum order quantities vary by item:\n• T-shirts and hoodies: 12 items\n• Stickers and small items: 25 items\n• Banners and large prints: 5 items\n\nWe offer flexible options for smaller organizations.",
    },
    {
      question: "How can we fund our merchandise?",
      answer: (
        <div>
          <p>Funding options include:</p>
          <ul className="list-disc pl-5">
            <li>Organization budget allocations</li>
            <li>Fundraising event proceeds</li>
            <li>Member contributions</li>
            <li>Sponsorship funds</li>
            <li>Pre-selling items to members</li>
          </ul>
          <p className="mt-2 text-sm italic">
            Tip: Many organizations use merchandise sales as a fundraising tool!
          </p>
        </div>
      ),
    },
    {
      question: "Can we customize the design of our merchandise?",
      answer:
        "Absolutely! We offer:\n• Full custom design services\n• Logo integration\n• Color matching\n• Multiple design revision rounds\n• Vector file compatibility\n• Mockup previews before production",
    },
    {
      question: "What is the approval process for merchandise orders?",
      answer: (
        <div>
          <p>Our approval process involves:</p>
          <ol className="list-decimal pl-5">
            <li>Submit initial design and order request</li>
            <li>Organization leadership reviews</li>
            <li>Design approval by designated administrator</li>
            <li>Financial authorization</li>
            <li>Production confirmation</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            Typical approval time: 2-3 business days
          </p>
        </div>
      ),
    },
    {
      question: "Do you offer student discounts?",
      answer:
        "Yes! We provide:\n• 10% discount for first-time organization orders\n• Volume discounts for orders over 50 items\n• Seasonal promotional discounts\n• Special rates for non-profit student groups",
    },
    {
      question: "How do returns and exchanges work?",
      answer:
        "Our return policy for student organizations:\n• Defective items: 100% refund or immediate replacement\n• Design errors: Free redesign and reprint\n• Size/color issues: Exchange within 14 days\n• Custom items: No returns unless manufacturing defect exists",
    },
    {
      question: "Can individual members order merchandise?",
      answer:
        "Individual orders require:\n• Organization approval\n• Minimum quantity requirements\n• Payment through organization account\n• Verification of current membership status",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-emerald-900">
        Student Organization Merchandise FAQs
      </h1>
      <div className="rounded-lg bg-white p-6 shadow-md">
        {faqData.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Still have questions? Contact our support team at{" "}
          <span className="text-emerald-700">support@campusmerch.com</span>
        </p>
      </div>
    </div>
  );
};

export default MerchandiseFAQs;
