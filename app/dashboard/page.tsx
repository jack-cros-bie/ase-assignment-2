"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Calendar, CheckCircle2, Briefcase } from "lucide-react";

// Dashboard items configuration
const dashboardItems = [
  { title: "Employee Details", href: "/employee-details", icon: <User size={48} /> },
  { title: "Timesheets & Annual Leave", href: "/applications/timesheet", icon: <Calendar size={48} /> },
  { title: "Manager Approvals", href: "/manager-approvals", icon: <CheckCircle2 size={48} /> },
  { title: "Recruitment Portal", href: "/recruitment-portal", icon: <Briefcase size={48} /> },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center p-6">
          {/* Left: Home Link (invisible placeholder for centering) */}
          <Link href="/" className="text-xl font-semibold text-blue-600 hover:text-blue-800 invisible">
            StreamLine Corp
          </Link>

          {/* Center: Dashboard Title */}
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Employee Dashboard
          </h1>

          {/* Right: Logo */}
          <div className="w-12 h-12 relative justify-self-end">
            <Image
              src="/media/logo.png"
              alt="StreamLine Corp Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-6 flex flex-col items-center">
        {/* Welcome Section */}
        <section className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome Back, <span className="text-blue-600">Team Member</span>!
          </h2>
          <p className="text-gray-600">Select an option below to get started.</p>
        </section>

        {/* Centered Dashboard Buttons */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {dashboardItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group w-48 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
              >
                <div className="text-blue-600 group-hover:text-blue-800 mb-4">
                  {item.icon}
                </div>
                <span className="text-lg font-medium text-gray-800">
                  {item.title}
                </span>
              </motion.button>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

