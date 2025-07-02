"use client";

import React, { useEffect, useState } from "react";
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
    // Fetch a few highlighted employees from the backend
    fetch("/api/employees/key")
      .then((res) => res.json())
      .then((data) => setKeyEmployees(data))
      .catch((err) => console.error("Failed to load key employees:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            StreamlineCorp
          </Link>
          <nav className="space-x-4">
            <Link href="/applications" className="hover:text-indigo-500">
              Applications
            </Link>
            <Link href="/login" className="hover:text-indigo-500">
              Login
            </Link>
            <Link href="/register" className="hover:text-indigo-500">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="container mx-auto text-center py-16">
        <h1 className="text-5xl font-extrabold text-gray-800">
          Welcome to StreamlineCorp
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          A fast-growing company with over 2,000 employees across multiple countries.
        </p>
      </section>

      {/* Key Employees section */}
      <section className="container mx-auto py-8">
        <h2 className="text-3xl font-semibold text-gray-800">Key Employees</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyEmployees.map((emp) => (
            <div
              key={emp.UserId}
              className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold">
                {emp.Firstname} {emp.Surname}
              </h3>
              <p className="mt-2 text-gray-600">{emp.JobTitle}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

