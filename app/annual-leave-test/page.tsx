import React, { useState, useRef, useMemo } from "react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";

export default function AnnualLeavePortal() {
  const today = new Date();
  const [selectedDates, setSelectedDates] = useState([]);
  const [approvedDates, setApprovedDates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [leaveSummary, setLeaveSummary] = useState({
    total: 21,
    used: 7,
    booked: 5,
    remaining: 9,
  });

  const calendarDates = useMemo(() => eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  }), [today]);

  const handleMouseDown = (date) => {
    setIsDragging(true);
    setSelectedDates([date]);
  };

  const handleMouseEnter = (date) => {
    if (isDragging && !selectedDates.some(d => isSameDay(d, date))) {
      setSelectedDates(prev => [...prev, date]);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleRequestLeave = () => {
    if (selectedDates.length === 0) return alert("Select days first");

    const newApproved = [...approvedDates, ...selectedDates];
    const updatedRemaining = leaveSummary.remaining - selectedDates.length;

    setApprovedDates(newApproved);
    setLeaveSummary(prev => ({
      ...prev,
      booked: prev.booked + selectedDates.length,
      remaining: Math.max(0, updatedRemaining),
    }));
    setSelectedDates([]);
    alert("Leave has been requested");
  };

  const isSelected = (date) => selectedDates.some(d => isSameDay(d, date));
  const isApproved = (date) => approvedDates.some(d => isSameDay(d, date));

  const uniqueApprovedDates = useMemo(() => {
    const seen = new Set();
    return approvedDates.filter(date => {
      const key = date.toDateString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [approvedDates]);

  return (
    <div
      className="p-6 font-sans select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button className="border p-2 rounded text-lg hover:bg-gray-200">←</button>
        <h1 className="text-3xl font-bold text-center flex-1 text-gray-700">
          Streamline Corp – Annual Leave
        </h1>
        <div className="border p-4 w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
          Logo
        </div>
      </div>

      {/* Calendar and Info */}
      <div className="flex flex-wrap gap-6">
        {/* Calendar */}
        <div className="border p-4 rounded shadow-md">
          <h2 className="text-xl font-semibold text-center mb-2">{format(today, "MMMM yyyy")}</h2>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center font-bold text-gray-600">{day}</div>
            ))}
            {calendarDates.map(date => (
              <div
                key={date.toString()}
                onMouseDown={() => handleMouseDown(date)}
                onMouseEnter={() => handleMouseEnter(date)}
                className={`text-center py-2 rounded cursor-pointer transition-all
                  ${isSelected(date) ? "bg-blue-200" : ""}
                  ${isApproved(date) ? "bg-green-200" : ""}
                  ${!isSameMonth(date, today) ? "text-gray-400" : "text-gray-800"}
                `}
              >
                {format(date, "d")}
              </div>
            ))}
          </div>
        </div>

        {/* Leave Info */}
        <div className="flex flex-col gap-4">
          <div className="border p-4 w-64 rounded shadow">
            <p><strong>Total Annual Leave:</strong> {leaveSummary.total} days</p>
            <p><strong>Annual Leave used:</strong> {leaveSummary.used} days</p>
            <p><strong>Annual Leave booked:</strong> {leaveSummary.booked} days</p>
            <p><strong>Annual Leave remaining:</strong> {leaveSummary.remaining} days</p>
          </div>

          <div className="border p-4 w-64 rounded shadow">
            <p className="font-bold">Key:</p>
            <ul className="text-sm list-disc list-inside">
              <li><span className="bg-blue-200 px-1 rounded">&nbsp;</span> Leave Requested</li>
              <li><span className="bg-green-200 px-1 rounded">&nbsp;</span> Leave Approved</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selection and Actions */}
      <div className="mt-6">
        <div className="border p-2 mb-4 rounded shadow">
          Days Selected: {selectedDates.length > 0 ? selectedDates.map(d => format(d, "do MMM")).join(", ") : "None"}
        </div>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSelectedDates([])}
            className="border w-full py-2 rounded hover:bg-red-100 shadow"
          >
            Cancel Leave
          </button>
          <button
            onClick={handleRequestLeave}
            className="border w-full py-2 rounded hover:bg-green-100 shadow"
          >
            Request Leave
          </button>
        </div>
        <div className="border p-2 rounded shadow">
          Upcoming Leave: {uniqueApprovedDates.length > 0 ? uniqueApprovedDates.map(d => format(d, "do MMM")).join(", ") : "None"}
        </div>
      </div>
    </div>
  );
}
