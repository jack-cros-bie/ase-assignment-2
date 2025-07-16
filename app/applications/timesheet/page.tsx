'use client';

import React, { useState } from 'react';

type BookingEntry = {
  id: number;
  day: string;
  code: string;
  start: string;
  end: string;
  hours: string;
};

const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  return monday;
};

const getFormattedWeekDates = (monday: Date): { day: string; label: string }[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      day: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'][i],
      label: `${day} ${month}`,
    };
  });
};

export default function TimesheetPage() {
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [entries, setEntries] = useState<BookingEntry[]>([]);

  const weekDates = getFormattedWeekDates(weekStart);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        day: selectedDay,
        code: '',
        start: '',
        end: '',
        hours: '',
      },
    ]);
  };

  const updateEntry = (id: number, field: keyof BookingEntry, value: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekStart(getStartOfWeek(newDate));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">Streamline Corp – Timesheets</div>
        <div className="text-sm">Date: {new Date().toLocaleDateString()}</div>
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
            className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0"
          >
            <div className="text-sm text-gray-500 w-full md:w-auto">Day: <strong>{entry.day}</strong></div>
            <input
              type="text"
              placeholder="Booking Code"
              value={entry.code}
              onChange={(e) => updateEntry(entry.id, 'code', e.target.value)}
              className="border p-2 rounded w-full md:w-1/4"
            />
            <input
              type="time"
              value={entry.start}
              onChange={(e) => updateEntry(entry.id, 'start', e.target.value)}
              className="border p-2 rounded w-full md:w-1/4"
            />
            <input
              type="time"
              value={entry.end}
              onChange={(e) => updateEntry(entry.id, 'end', e.target.value)}
              className="border p-2 rounded w-full md:w-1/4"
            />
            <input
              type="text"
              placeholder="Hours"
              value={entry.hours}
              onChange={(e) => updateEntry(entry.id, 'hours', e.target.value)}
              className="border p-2 rounded w-full md:w-1/6"
            />
            <button
            onClick={() =>
            setEntries((prev) => prev.filter((e) => e.id !== entry.id))
            }
            className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
            Remove<br/>Item -
            </button>
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

      {/* Weekdays + Navigation + Submit Buttons */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
          <button
            onClick={() => changeWeek('prev')}
            className="mb-2 md:mb-0 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            ← Previous Week
          </button>

          <div className="flex space-x-2 text-center text-sm font-medium">
            {weekDates.map(({ day, label }) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-2 w-16 rounded ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {day}
                <div className="text-xs">{label}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => changeWeek('next')}
            className="mt-2 md:mt-0 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
          >
            Next Week →
          </button>
        </div>

        <div className="flex space-x-4">
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
