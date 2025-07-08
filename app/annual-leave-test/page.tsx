"use client";


import React, { useState, useRef } from "react";

const daysInMonth = [
  ["", "1st", "2nd", "3rd", "4th"],
  ["7th", "8th", "9th", "10th", "11th"],
  ["14th", "15th", "16th", "17th", "18th"],
  ["21st", "22nd", "23rd", "24th", "25th"],
  ["28th", "29th", "30th", "31st", ""]
];

const AnnualLeaveCalendar = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [approvedDays, setApprovedDays] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStart = useRef<{ row: number; col: number } | null>(null);

  const selectHighlightRange = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    const [startRow, endRow] = [start.row, end.row].sort((a,b) => a - b);
    const [startCol, endCol] = [start.col, end.col].sort((a,b) => a - b);

    let daysToSelect: string[] = [];

    if (startRow === endRow) {
      for (let c = startCol; c <= endCol; c++) {
        const day = daysInMonth[startRow][c];
        if (day) daysToSelect.push(day);
      }
    } else {
      for (let c = start.col; c < daysInMonth[startRow].length; c++) {
        const day = daysInMonth[startRow][c];
        if (day) daysToSelect.push(day);
      }
      for (let r = startRow + 1; r < endRow; r++) {
        for (let c = 0; c < daysInMonth[r].length; c++) {
          const day = daysInMonth[r][c];
          if (day) daysToSelect.push(day);
        }
      }
      for (let c = 0; c <= end.col; c++) {
        const day = daysInMonth[endRow][c];
        if (day) daysToSelect.push(day);
      }
    }

    setSelectedDays(daysToSelect);
  };

  const handleMouseDown = (row: number, col: number, day: string) => {
    if (!day) return;
    setIsSelecting(true);
    selectionStart.current = { row, col };
    setSelectedDays([day]);
  };

  const handleMouseEnter = (row: number, col: number, day: string) => {
    if (!day || !isSelecting || !selectionStart.current) return;
    selectHighlightRange(selectionStart.current, { row, col });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    selectionStart.current = null;
  };

  const handleRequestLeave = () => {
    if (selectedDays.length === 0) {
      alert("No days selected!");
      return;
    }
    alert("Annual leave confirmed");
    setApprovedDays((prev) => Array.from(new Set([...prev, ...selectedDays])));
    setSelectedDays([]);
  };

  const handleCancelLeave = () => {
    if (selectedDays.length === 0) {
      alert("No days selected!");
      return;
    }
    setApprovedDays((prev) => prev.filter(day => !selectedDays.includes(day)));
    setSelectedDays([]);
  };

  return (
    <div
      className="p-4 font-sans"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between items-start">
        <button className="border p-1">⬅</button>
        <h1 className="text-xl font-bold text-center flex-1">
          Streamline Corp – Annual Leave
        </h1>
        <div className="w-16 h-16 border flex justify-center items-center">Logo</div>
      </div>

      <div className="flex mt-4">
        <div className="border w-2/3">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th></th>
                <th colSpan={5} className="text-center">Calendar</th>
              </tr>
              <tr className="border-b">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <th key={day} className="border px-2 py-1">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysInMonth.map((week, rowIndex) => (
                <tr key={rowIndex}>
                  {week.map((day, colIndex) => {
                    const isSelected = selectedDays.includes(day);
                    const isApproved = approvedDays.includes(day);
                    const isLocked = isApproved;
                    return (
                      <td
                        key={colIndex}
                        className={`border text-center h-12
                          ${isApproved ? "bg-green-400 text-white" : ""}
                          ${isSelected && !isApproved ? "bg-blue-300" : ""}
                          ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
                        `}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex, day)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex, day)}
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
            <p>Total Annual Leave: <strong>21 days</strong></p>
            <p>Annual Leave used: <strong>{approvedDays.length} days</strong></p>
            <p>Annual Leave booked: <strong>{approvedDays.length} days</strong></p>
            <p>Annual Leave remaining: <strong>{21 - approvedDays.length} days</strong></p>
          </div>

          <div className="border p-2">
            <p><strong>Key:</strong></p>
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
          <p><strong>Days Selected:</strong> {selectedDays.join(", ")}</p>
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
          <p><strong>Upcoming Leave:</strong></p>
          {approvedDays.length === 0 ? (
            <p>No upcoming leave</p>
          ) : (
            <p>{approvedDays.join(", ")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnualLeaveCalendar;
