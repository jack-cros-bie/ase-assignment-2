"use client";


import React, { useState, useRef, useEffect } from "react";

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

const AnnualLeaveCalendar = () => {
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
        className="p-4 font-sans"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: "none" }}
      >
        <div className="flex justify-between items-center">
          <select
            className="border p-1"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>
                {name} {year}
              </option>
            ))}
          </select>
          <h1 className="text-xl font-bold text-center flex-1">
            Streamline Corp – Annual Leave
          </h1>
          <div className="w-16 h-16 border flex justify-center items-center">Logo</div>
        </div>

        <div className="flex mt-4">
          <div className="border w-2/3">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr>
                  {weekDays.map((day) => (
                    <th key={day} className="border px-2 py-1">
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
                            className={`border h-12 cursor-pointer select-none
                              ${isApproved ? "bg-green-400 text-white" : ""}
                              ${isSelected && !isApproved ? "bg-blue-300" : ""}
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

          <div className="ml-4 w-1/3 flex flex-col gap-4">
            <div className="border p-2">
              <p>
                Total Annual Leave: <strong>{totalLeaveAllowed} days</strong>
              </p>
              <p>
                Annual Leave used: <strong>{totalApproved} days</strong>
              </p>
              <p>
                Annual Leave booked: <strong>{totalApproved} days</strong>
              </p>
              <p>
                Annual Leave remaining:{" "}
                <strong>{totalLeaveAllowed - totalApproved} days</strong>
              </p>
            </div>

            <div className="border p-2">
              <p>
                <strong>Key:</strong>
              </p>
              <ul className="text-sm list-disc pl-4">
                <li>Leave Requested (Blue)</li>
                <li>Leave Approved (Green)</li>
                <li>Leave Taken</li>
                <li>Bank Holiday</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex-1 border p-2">
            <p>
              <strong>Days Selected:</strong> {selectedDays.join(", ")}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                className="border px-4 py-2"
                onClick={handleCancelLeave}
                disabled={selectedDays.length === 0}
              >
                Cancel Leave
              </button>
              <button
                className="border px-4 py-2"
                onClick={handleRequestLeave}
                disabled={selectedDays.length === 0}
              >
                Request Leave
              </button>
            </div>
          </div>

          <div className="flex-1 border p-2">
            <p>
              <strong>Upcoming Leave:</strong>
            </p>
            <p>{upcomingLeave}</p>
          </div>
        </div>
      </div>

      {/* Modal popup */}
      {modalMessage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setModalMessage(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4">{modalMessage}</p>
            <button
              className="border px-4 py-2"
              onClick={() => setModalMessage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnualLeaveCalendar;
