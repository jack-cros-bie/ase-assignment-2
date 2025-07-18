'use client';

import React, { useEffect, useState } from 'react';

type BookingEntry = {
  id: number;
  date: string;
  code: string;
  start: string;
  end: string;
  hours: string;
};

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

const getDateFromDay = (monday: Date, day: string): string => {
  const index = dayLabels.indexOf(day);
  const d = new Date(monday);
  d.setDate(monday.getDate() + index);
  return d.toISOString().slice(0, 10);
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
      day: dayLabels[i],
      label: `${day} ${month}`,
    };
  });
};

export default function TimesheetPage() {
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [entries, setEntries] = useState<BookingEntry[]>([]);
  const [frequentCodes, setFrequentCodes] = useState<string[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [allocation, setAllocation] = useState<Record<string, number>>({});
  const weekDates = getFormattedWeekDates(weekStart);

  const fetchRecentCodes = async () => {
    try {
      const res = await fetch("/api/timesheet/recent", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setFrequentCodes(data.recentCodes);
      } else {
        console.error("Failed to fetch recent codes:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoadingCodes(false);
    }
  };

  const fetchAllocation = async () => {
    try {
      const res = await fetch(`/api/timesheet/allocation?week=${weekStart.toISOString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setWeeklyHours(data.totalHours);
        setAllocation(data.breakdown);
      } else {
        console.error("Allocation fetch error:", data.error);
      }
    } catch (err) {
      console.error("Allocation fetch failed:", err);
    }
  };


  useEffect(() => {
    fetchRecentCodes();
    fetchAllocation();
  }, [weekStart]);

  const addEntry = () => {
    const newDate = getDateFromDay(weekStart, selectedDay);
    setEntries((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((e) => e.id)) + 1 : 1,
        date: newDate,
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

  const stripTime = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const getTotalBookedHours = () => {
    const monday = stripTime(new Date(weekStart));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return entries.reduce((sum, entry) => {
      const entryDate = stripTime(new Date(entry.date));
      const hours = parseFloat(entry.hours);
      const isInWeek = entryDate >= monday && entryDate <= sunday;

      if (!isNaN(hours) && isInWeek) {
        return sum + hours;
      }
      return sum;
    }, 0);
  };

  const handleSubmit = async () => {
    const validEntries = entries
      .filter((e) => e.code && e.date && e.start && e.end)
      .map(({ code, date, start, end }) => ({
        code,
        date,
        start,
        end,
      }));

    if (validEntries.length === 0) {
      alert("No valid entries to submit.");
      return;
    }

    const response = await fetch("/api/timesheet/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entries: validEntries }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Timesheets submitted successfully!");
      fetchRecentCodes();
      fetchAllocation();
      // Optionally clear entries:
      // setEntries([]);
    } else {
      alert(`Error: ${result.error}`);
    }
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
          Booked this week: <strong>{weeklyHours.toFixed(2)} Hours</strong>
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
            <div className="text-sm text-gray-500 w-full md:w-auto">
              Date: <strong>{entry.date}</strong>
            </div>
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
              Remove<br />Item -
            </button>
          </div>
        ))}
      </div>

      {/* Recently Used Codes */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Recently Used Codes</h2>
        {loadingCodes ? (
          <p className="text-gray-500">Loading...</p>
        ) : frequentCodes.length === 0 ? (
          <p className="text-gray-500">No recent codes found.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {frequentCodes.map((code, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {code}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Allocation Breakdown */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="font-semibold mb-2">Allocation breakdown</div>
        {weeklyHours === 0 ? (
          <div className="text-gray-500">No hours booked.</div>
        ) : (
          <ul className="list-disc list-inside">
            {Object.entries(allocation).map(([code, hrs]) => (
              <li key={code}>
                {code} – {((hrs / weeklyHours) * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        )}
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
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit This Week
          </button>
          <a
            href="http://localhost:3000/annual-leave"
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Book Annual Leave
          </a>
        </div>
      </div>
    </div>
  );
}
