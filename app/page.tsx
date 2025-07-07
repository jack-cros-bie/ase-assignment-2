"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Employee {
  UserId: number;
  Firstname: string;
  Surname: string;
  JobTitle: string;
}

export default function HomePage() {
  const [keyEmployees, setKeyEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("/api/employees/key")
      .then((res) => res.json())
      .then((data) => setKeyEmployees(data))
      .catch((err) => console.error("Failed to load key employees:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/media/logo.png" alt="StreamlineCorp Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-indigo-600">StreamlineCorp</span>
          </Link>
          <nav className="space-x-6">
            <Link href="/applications" className="text-gray-700 hover:text-indigo-600 transition">Applications</Link>
            <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Login</Link>
            <Link href="/register" className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">Register</Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-96 w-full">
        <Image
          src="/media/hero.jpg"
          alt="StreamlineCorp banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-indigo-900/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white">
            Welcome to StreamlineCorp
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl">
            A fast-growing company with over 2,000 employees across the globe.
          </p>
          <div className="mt-6 flex space-x-4">
            <Link href="/login" className="px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition">
              Login
            </Link>
            <Link href="/register" className="px-6 py-3 bg-white text-indigo-600 rounded-full hover:bg-gray-100 transition">
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* Key Employees */}
      <section className="container mx-auto py-16 flex-1">
        <h2 className="text-3xl font-semibold text-gray-800 text-center">Key Team Members</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {keyEmployees.map((emp) => (
            <div
              key={emp.UserId}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={`/media/employee_${emp.UserId % 5 + 1}.jpg`}
                  alt={`${emp.Firstname} ${emp.Surname}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {emp.Firstname} {emp.Surname}
                </h3>
                <p className="mt-2 text-indigo-600 font-medium">{emp.JobTitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-6">
        <div className="container mx-auto text-center text-gray-600">
          © {new Date().getFullYear()} StreamlineCorp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

