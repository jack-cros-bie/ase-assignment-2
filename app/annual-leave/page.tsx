"use client";

import { useState, useEffect, useRef } from "react";

// Leave statuses
type LeaveStatus = "pending_approval" | "approved" | "rejected";

// Leave entry shape
interface LeaveEntry {
  date: string; // "YYYY-MM-DD"
  approval_status: LeaveStatus;
}

export default function AnnualLeavePage() {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dragSelecting = useRef(false);
  const dragStartDate = useRef<string | null>(null);

  useEffect(() => {
    async function fetchLeave() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/timesheet/request?month=${month}`);
        if (!res.ok) {
          const json = await safeJson(res);
          throw new Error(json?.error || "Failed to load leave data");
        }
        const data: LeaveEntry[] = await res.json();
        setLeaveEntries(Array.isArray(data) ? data : []);
        setSelectedDates(new Set());
      } catch (err: any) {
        setError(err.message || "Failed to load leave data");
      } finally {
        setLoading(false);
      }
    }
    fetchLeave();
  }, [month]);

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  function getDatesInRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const step = startDate <= endDate ? 1 : -1;

    while (true) {
      dates.push(startDate.toISOString().slice(0, 10));
      if (startDate.getTime() === endDate.getTime()) break;
      startDate.setDate(startDate.getDate() + step);
    }
    return dates;
  }

  function onPointerDown(date: string) {
    dragSelecting.current = true;
    dragStartDate.current = date;
    setSelectedDates((prev) => {
      const newSet = new Set(prev);
      newSet.add(date);
      return newSet;
    });
  }

  function onPointerEnter(date: string) {
    if (!dragSelecting.current || !dragStartDate.current) return;

    const range = getDatesInRange(dragStartDate.current, date);
    const validDates = weekdays.filter((d) => range.includes(d));

    setSelectedDates((prev) => {
      const newSet = new Set(prev);
      for (const d of validDates) {
        newSet.add(d);
      }
      return newSet;
    });
  }

  function onPointerUp() {
    dragSelecting.current = false;
    dragStartDate.current = null;
  }

  async function submitLeaveRequest() {
    if (selectedDates.size === 0) {
      alert("Please select at least one date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/timesheet/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: Array.from(selectedDates) }),
      });

      const json = await safeJson(res);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to request leave");
      }

      alert("Leave request submitted. Status is now pending approval.");

      const refreshed = await fetch(`/api/timesheet/request?month=${month}`);
      if (!refreshed.ok) throw new Error("Failed to refresh leave data");

      const refreshedData: LeaveEntry[] = await refreshed.json();
      setLeaveEntries(Array.isArray(refreshedData) ? refreshedData : []);
      setSelectedDates(new Set());
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  }

  async function cancelLeaveRequest() {
    if (selectedDates.size === 0) {
      alert("Please select at least one date to cancel.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/timesheet/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: Array.from(selectedDates) }),
      });

      const json = await safeJson(res);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to cancel leave");
      }

      alert("Leave cancelled successfully.");

      const refreshed = await fetch(`/api/timesheet/request?month=${month}`);
      if (!refreshed.ok) throw new Error("Failed to refresh leave data");

      const refreshedData: LeaveEntry[] = await refreshed.json();
      setLeaveEntries(Array.isArray(refreshedData) ? refreshedData : []);
      setSelectedDates(new Set());
    } catch (err: any) {
      setError(err.message || "Failed to cancel leave");
    } finally {
      setLoading(false);
    }
  }

  function getWeekdaysInMonth(year: number, monthIndex: number) {
    const date = new Date(year, monthIndex, 1);
    const dates: string[] = [];
    while (date.getMonth() === monthIndex) {
      const day = date.getDay();
      if (day >= 1 && day <= 5) {
        dates.push(date.toISOString().slice(0, 10));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  const [year, monthNum] = month.split("-").map(Number);
  const weekdays = getWeekdaysInMonth(year, monthNum - 1);

  function getStatusColor(date: string): string {
    if (selectedDates.has(date)) return "#add8e6";
    const entry = leaveEntries.find((e) => e.date === date);
    if (!entry) return "transparent";
    switch (entry.approval_status) {
      case "pending_approval":
        return "#FFBF00";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "transparent";
    }
  }

  const approvedDays = leaveEntries.filter(e => e.approval_status === "approved").length;
  const pendingDays = leaveEntries.filter(e => e.approval_status === "pending_approval").length;
  const rejectedDays = leaveEntries.filter(e => e.approval_status === "rejected").length;
  const totalAllowance = 25;
  const remaining = totalAllowance - approvedDays;

  const upcomingLeave = leaveEntries
    .filter(e => e.approval_status === "approved" || e.approval_status === "pending_approval")
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div
      style={{ backgroundColor: "#f9f9f9", display: "flex", padding: 20 }}
      onPointerUp={onPointerUp}
    >
      <div style={{ flex: 1, maxWidth: 700 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 10 }}>Annual Leave Request</h1>

        <label>
          Select month: {" "}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={loading}
            style={{ marginBottom: 10 }}
          />
        </label>

        {error && <p style={{ color: "red", marginTop: 10 }}>Error: {error}</p>}

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 8,
          }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((wd) => (
            <div key={wd} style={{ fontWeight: "bold", textAlign: "center" }}>{wd}</div>
          ))}

          {weekdays.map((dateStr) => {
            const dayNum = parseInt(dateStr.slice(-2), 10);
            const isSelected = selectedDates.has(dateStr);
            const statusColor = getStatusColor(dateStr);

            return (
              <div
                key={dateStr}
                onPointerDown={() => onPointerDown(dateStr)}
                onPointerEnter={() => onPointerEnter(dateStr)}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  padding: 10,
                  borderRadius: 6,
                  border: isSelected ? "2px solid #000" : "1px solid #ccc",
                  backgroundColor: statusColor,
                  color: statusColor === "transparent" || isSelected ? "#000" : "#fff",
                  textAlign: "center",
                  fontWeight: "600",
                  transition: "background-color 0.2s, border 0.2s",
                  touchAction: "none",
                }}
                title={`Date: ${dateStr}\nStatus: ${leaveEntries.find((e) => e.date === dateStr)?.approval_status || "None"}`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            onClick={submitLeaveRequest}
            disabled={loading || selectedDates.size === 0}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: selectedDates.size === 0 ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: selectedDates.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Request Leave"}
          </button>

          <button
            onClick={cancelLeaveRequest}
            disabled={loading || selectedDates.size === 0}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: selectedDates.size === 0 ? "#ccc" : "#e00",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: selectedDates.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Cancel Leave"}
          </button>

          <button
            onClick={() => setSelectedDates(new Set())}
            disabled={loading || selectedDates.size === 0}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: selectedDates.size === 0 ? "#ccc" : "#666",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: selectedDates.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            Clear Selection
          </button>
        </div>
      </div>

      <div style={{ marginLeft: 40, minWidth: 220 }}>
        <div style={{ marginBottom: 16 }}>
          <strong>Key:</strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <span style={{ backgroundColor: "#FFBF00", padding: "4px 8px", borderRadius: 4 }}>Pending</span>
            <span style={{ backgroundColor: "#4CAF50", padding: "4px 8px", borderRadius: 4, color: "white" }}>Approved</span>
            <span style={{ backgroundColor: "#F44336", padding: "4px 8px", borderRadius: 4, color: "white" }}>Rejected</span>
            <span style={{ backgroundColor: "#add8e6", padding: "4px 8px", borderRadius: 4 }}>Selected</span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p><strong>Total Allowance:</strong> {totalAllowance} days</p>
          <p><strong>Approved:</strong> {approvedDays} days</p>
          <p><strong>Pending:</strong> {pendingDays} days</p>
          <p><strong>Rejected:</strong> {rejectedDays} days</p>
          <p><strong>Remaining:</strong> {remaining} days</p>
        </div>

        <div>
          <strong>Upcoming Leave:</strong>
          <ul>
            {upcomingLeave.map((entry) => (
              <li key={entry.date}>{entry.date} - {entry.approval_status}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
