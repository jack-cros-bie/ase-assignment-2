'use client';

import React, { useState } from "react";

type BookingEntry = {
  id: number;
  code: string;
  start: string;
  end: string;
  hours: string;
};

export default function TimesheetPage() {
  const [entries, setEntries] = useState<BookingEntry[]>([
    { id: 1, code: "", start: "", end: "", hours: "" },
  ]);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        code: "",
        start: "",
        end: "",
        hours: "",
      },
    ]);
  };

  const updateEntry = (
    id: number,
    field: keyof BookingEntry,
    value: string
  ) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">Streamline Corp – Timesheets</div>
        <div className="text-sm">Date: XX/XX/XX</div>
      </div>

      {/* Overview Section */}
      <div className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center">
        <div className="text-lg font-semibold">Overview</div>
        <div className="text-sm">
          Booked this week: <strong>37 Hours</strong>
        </div>
      </div>

      {/* Add Item */}
      <button
        onClick={addEntry}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Item +
      </button>

      {/* Booking Entries */}
      <div className="space-y-2 mb-6">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white p-4 rounded shadow flex items-center space-x-4"
          >
            <input
              type="text"
              placeholder="Booking Code"
              value={entry.code}
              onChange={(e) => updateEntry(entry.id, "code", e.target.value)}
              className="border p-2 rounded w-1/3"
            />
            <input
              type="time"
              value={entry.start}
              onChange={(e) => updateEntry(entry.id, "start", e.target.value)}
              className="border p-2 rounded w-1/4"
            />
            <input
              type="time"
              value={entry.end}
              onChange={(e) => updateEntry(entry.id, "end", e.target.value)}
              className="border p-2 rounded w-1/4"
            />
            <input
              type="text"
              placeholder="Hours"
              value={entry.hours}
              onChange={(e) => updateEntry(entry.id, "hours", e.target.value)}
              className="border p-2 rounded w-1/6"
            />
          </div>
        ))}
      </div>

      {/* Frequently Used Codes */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="font-semibold mb-2">Frequently used Codes:</div>
        <ul className="list-disc list-inside">
          <li>XXXXXX</li>
          <li>XXXXXX</li>
          <li>XXXXXX</li>
        </ul>
      </div>

      {/* Allocation Breakdown */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="font-semibold mb-2">Allocation breakdown</div>
        <div>XXXXXX - 100%</div>
      </div>

      {/* Weekdays + Submit Buttons */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-center">
        <div className="flex space-x-4 text-center text-sm font-medium">
          {["Mon", "Tue", "Wed", "Thur", "Fri"].map((day) => (
            <div key={day} className="p-2 w-12 bg-gray-200 rounded">
              {day}
              <div className="text-xl">XX</div>
            </div>
          ))}
        </div>

        <div className="flex space-x-4 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Submit This Week
          </button>
          <a
            href="http://localhost:3000/applications/annual%20leave"
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Book Annual Leave
          </a>
        </div>
      </div>
    </div>
  );
}
