import React from "react";

export default function TimesheetPage() {
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
        <div className="text-sm">Booked this week: <strong>37 Hours</strong></div>
      </div>

      {/* Add Item */}
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Add Item +
      </button>

      {/* Booking Entries */}
      <div className="space-y-2 mb-6">
        {[1, 2, 3].map((entry, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow flex items-center space-x-4">
            <input
              type="text"
              placeholder="Booking Code"
              className="border p-2 rounded w-1/3"
            />
            <input
              type="time"
              placeholder="Start Time"
              className="border p-2 rounded w-1/4"
            />
            <input
              type="time"
              placeholder="End Time"
              className="border p-2 rounded w-1/4"
            />
            <input
              type="text"
              placeholder="Hours"
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
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Book Annual Leave
          </button>
        </div>
      </div>
    </div>
  );
}