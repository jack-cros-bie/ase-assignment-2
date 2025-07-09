"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const year = 2025;

function formatDayWithSuffix(d: number) {
  if (d === 1 || d === 21 || d === 31) return d + "st";
  if (d === 2 || d === 22) return d + "nd";
  if (d === 3 || d === 23) return d + "rd";
  return d + "th";
}

const AnnualLeave = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [approvedDays, setApprovedDays] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStart = useRef<{ index: number } | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  const weekdaysInMonth: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, currentMonth, d);
    if (isWeekday(date)) {
      weekdaysInMonth.push(formatDayWithSuffix(d));
    }
  }

  const weeksCount = Math.ceil(weekdaysInMonth.length / 5);

  while (weekdaysInMonth.length < weeksCount * 5) {
    weekdaysInMonth.push("");
  }

  const fullDayString = (day: string) => `${monthNames[currentMonth]} ${day}`;

  const selectHighlightRange = (startIdx: number, endIdx: number) => {
    const [from, to] = [startIdx, endIdx].sort((a, b) => a - b);
    const daysToSelect: string[] = [];
    for (let i = from; i <= to; i++) {
      const day = weekdaysInMonth[i];
      if (day) daysToSelect.push(day);
    }
    setSelectedDays(daysToSelect);
  };

  const handleMouseDown = (index: number, day: string) => {
    if (!day) return;
    setIsSelecting(true);
    selectionStart.current = { index };
    setSelectedDays([day]);
  };

  const handleMouseEnter = (index: number, day: string) => {
    if (!day || !isSelecting || !selectionStart.current) return;
    selectHighlightRange(selectionStart.current.index, index);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    selectionStart.current = null;
  };

  const totalLeaveAllowed = 21;
  const totalApproved = approvedDays.length;

  const handleRequestLeave = () => {
    if (selectedDays.length === 0) {
      setModalMessage("No days selected!");
      return;
    }
    const remaining = totalLeaveAllowed - totalApproved;
    if (selectedDays.length > remaining) {
      setModalMessage("Too many days requested, please try again");
      return;
    }
    setApprovedDays((prev) => {
      const newDays = Array.from(
        new Set([
          ...prev,
          ...selectedDays.map((day) => fullDayString(day)),
        ])
      );
      return newDays;
    });
    setSelectedDays([]);
    setModalMessage("Annual leave confirmed");
  };

  const handleCancelLeave = () => {
    if (selectedDays.length === 0) {
      setModalMessage("No days selected!");
      return;
    }
    setApprovedDays((prev) => {
      const cancelDaysSet = new Set(selectedDays.map((day) => fullDayString(day)));
      return prev.filter((day) => !cancelDaysSet.has(day));
    });
    setSelectedDays([]);
  };

  const approvedDaysForCurrentMonth = approvedDays
    .filter((day) => day.startsWith(monthNames[currentMonth] + " "))
    .map((day) => day.replace(monthNames[currentMonth] + " ", ""));

  const upcomingLeave = approvedDays.length > 0 ? approvedDays.join(", ") : "No upcoming leave";

  useEffect(() => {
    setSelectedDays([]);
  }, [currentMonth]);

  return (
    <>
      <div
        className="p-6 font-sans bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: "none" }}
      >
        <div className="flex justify-between items-center mb-6">
          <select
            className="border rounded px-2 py-1 shadow"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>
                {name} {year}
              </option>
            ))}
          </select>
          <h1 className="text-3xl font-bold text-indigo-700 text-center flex-1">
            Streamline Corp – Annual Leave
          </h1>
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex justify-center items-center font-bold shadow">
            S
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-2/3">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  {weekDays.map((day) => (
                    <th key={day} className="py-2 text-indigo-800 font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: weeksCount }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {weekdaysInMonth
                      .slice(rowIndex * 5, rowIndex * 5 + 5)
                      .map((day, colIndex) => {
                        const cellIndex = rowIndex * 5 + colIndex;
                        const isSelected = selectedDays.includes(day);
                        const isApproved = approvedDaysForCurrentMonth.includes(day);
                        return (
                          <td
                            key={colIndex}
                            className={`h-14 rounded transition-colors duration-200 cursor-pointer select-none
                              ${isApproved ? "bg-green-500 text-white" : ""}
                              ${isSelected && !isApproved ? "bg-blue-400 text-white" : "hover:bg-indigo-200"}
                            `}
                            onMouseDown={() => handleMouseDown(cellIndex, day)}
                            onMouseEnter={() => handleMouseEnter(cellIndex, day)}
                            onDragStart={(e) => e.preventDefault()}
                          >
                            {day}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-1/3 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <p>Total Annual Leave: <strong>{totalLeaveAllowed} days</strong></p>
              <p>Annual Leave used: <strong>{totalApproved} days</strong></p>
              <p>Annual Leave booked: <strong>{totalApproved} days</strong></p>
              <p>Annual Leave remaining: <strong>{totalLeaveAllowed - totalApproved} days</strong></p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <p className="font-semibold">Key:</p>
              <ul className="text-sm list-disc pl-4">
                <li><span className="text-blue-500">Leave Requested</span></li>
                <li><span className="text-green-600">Leave Approved</span></li>
                <li className="text-gray-500">Leave Taken</li>
                <li className="text-red-400">Bank Holiday</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">Days Selected:</p>
            <p>{selectedDays.join(", ") || "None"}</p>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-red-100 hover:bg-red-300 text-red-800 px-4 py-2 rounded shadow disabled:opacity-50"
                onClick={handleCancelLeave}
                disabled={selectedDays.length === 0}
              >
                Cancel Leave
              </button>
              <button
                className="bg-blue-100 hover:bg-blue-300 text-blue-800 px-4 py-2 rounded shadow disabled:opacity-50"
                onClick={handleRequestLeave}
                disabled={selectedDays.length === 0}
              >
                Request Leave
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">Upcoming Leave:</p>
            <p>{upcomingLeave}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalMessage && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            onClick={() => setModalMessage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="mb-4">{modalMessage}</p>
              <button
                className="bg-indigo-100 hover:bg-indigo-300 text-indigo-800 px-4 py-2 rounded"
                onClick={() => setModalMessage(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnnualLeave;
