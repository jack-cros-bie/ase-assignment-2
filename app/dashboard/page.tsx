"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Calendar, CheckCircle2, Briefcase, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

// Dashboard items configuration
const dashboardItems = [
  { title: "Employee Details", href: "/employee-details", icon: <User /> },
  { title: "Timesheets & Leave", href: "/timesheet", icon: <Calendar /> },
  { title: "Approvals", href: "/manager-approvals", icon: <CheckCircle2 /> },
  { title: "Recruitment", href: "/recruitment-portal", icon: <Briefcase /> },
];

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const userName = "Alex"; // TODO: replace with real user data

  // Avoid hydration mismatch by calculating date on client
  const [today, setToday] = useState<string>("");
  useEffect(() => {
    const formatted = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    setToday(formatted);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-gray-900/70 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/media/logo.png" alt="Logo" width={36} height={36} />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition">
              StreamLine
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>
            <div className="flex items-center space-x-3">
              <Image
                src="/media/user-avatar.png"
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-gray-800 dark:text-gray-200 font-medium">{userName}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Welcome Section */}
      <header className="text-center py-16 px-6">
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome back, <span className="text-blue-600 dark:text-blue-400">{userName}</span>!
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Happy <span className="font-semibold">{today}</span>. What would you like to do today?
        </motion.p>
      </header>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardItems.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-transparent hover:border-blue-400 transition p-6 flex flex-col items-center"
            >
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition">
                {React.cloneElement(item.icon, { size: 48, className: 'text-blue-600 dark:text-blue-300' })}
              </div>
              <Link href={item.href} className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center hover:text-blue-600 dark:hover:text-blue-400 transition">
                {item.title}
              </Link>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}

