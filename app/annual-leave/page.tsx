use client";
 
import { useState, useEffect, useRef } from "react";
 
type LeaveStatus = "pending_approval" | "approved" | "rejected";
 
interface LeaveEntry {
  date: string; // YYYY-MM-DD in UK timezone
  approval_status: LeaveStatus;
}
 
export default function AnnualLeavePage() {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return toUKDateISO(now).slice(0, 7);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const dragSelecting = useRef(false);
  const dragStartDate = useRef<string | null>(null);
 
  function toUKDateISO(date: Date) {
    return date
      .toLocaleDateString("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-");
  }
 
  useEffect(() => {
    async function fetchLeave() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/annualleave?month=${month}`);
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
 
  function getWeekdaysInMonth(year: number, monthIndex: number): string[] {
    const dates: string[] = [];
    const date = new Date(Date.UTC(year, monthIndex, 1));
 
    while (date.getUTCMonth() === monthIndex) {
      const weekdayNum = date.getUTCDay();
      if (weekdayNum >= 1 && weekdayNum <= 5) {
        dates.push(toUKDateISO(date));
      }
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return dates;
  }
 
  function getDatesInRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const startDate = new Date(start + "T00:00:00Z");
    const endDate = new Date(end + "T00:00:00Z");
    const step = startDate <= endDate ? 1 : -1;
 
    let current = new Date(startDate);
    while (true) {
      dates.push(toUKDateISO(current));
      if (current.getTime() === endDate.getTime()) break;
      current.setUTCDate(current.getUTCDate() + step);
    }
    return dates;
  }
 
  function onPointerDown(date: string) {
    dragSelecting.current = true;
    dragStartDate.current = date;
    setSelectedDates((prev) => new Set(prev).add(date));
  }
 
  function onPointerEnter(date: string) {
    if (!dragSelecting.current || !dragStartDate.current) return;
    const range = getDatesInRange(dragStartDate.current, date);
    const validDates = weekdays.filter((d) => range.includes(d));
    setSelectedDates((prev) => {
      const newSet = new Set(prev);
      for (const d of validDates) newSet.add(d);
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
      const res = await fetch("/api/annualleave/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: Array.from(selectedDates) }),
      });
 
      const json = await safeJson(res);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to request leave");
      }
 
      alert("Leave request submitted. Status is now pending approval.");
 
      const refreshed = await fetch(`/api/annualleave?month=${month}`);
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
      const res = await fetch("/api/annualleave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: Array.from(selectedDates) }),
      });
 
      const json = await safeJson(res);
      if (!res.ok) {
        throw new Error(json?.error || "Failed to cancel leave");
      }
 
      alert("Leave cancelled successfully.");
 
      const refreshed = await fetch(`/api/annualleave?month=${month}`);
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
 
  const [year, monthNum] = month.split("-").map(Number);
  const weekdays = getWeekdaysInMonth(year, monthNum - 1);
 
  const approvedDays = leaveEntries.filter((e) => e.approval_status === "approved").length;
  const pendingDays = leaveEntries.filter((e) => e.approval_status === "pending_approval").length;
  const rejectedDays = leaveEntries.filter((e) => e.approval_status === "rejected").length;
  const totalAllowance = 25;
  const remaining = totalAllowance - approvedDays;
 
  const upcomingLeave = leaveEntries
    .filter((e) => e.approval_status === "approved" || e.approval_status === "pending_approval")
    .sort((a, b) => a.date.localeCompare(b.date));
 
  const upcomingMap = new Map(upcomingLeave.map((e) => [e.date, e.approval_status]));
 
  function getStatusColor(date: string): string {
    if (selectedDates.has(date)) return "#a8d0ff"; // lighter blue
    const status = upcomingMap.get(date);
    if (status === "pending_approval") return "#ffb300"; // amber
    if (status === "approved") return "#4caf50"; // green
    return "transparent";
  }
 
  return (
    <div
      style={{
        padding: 24,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        color: "#222",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: 24,
          fontWeight: "700",
          color: "#0d47a1",
          textAlign: "center",
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        Annual Leave Request
      </h1>
 
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <label
          htmlFor="month-select"
          style={{ fontWeight: "600", fontSize: 16, marginRight: 12, color: "#555" }}
        >
          Select month:
        </label>
        <input
          id="month-select"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          disabled={loading}
          style={{
            padding: "8px 12px",
            fontSize: 16,
            borderRadius: 6,
            border: "1.5px solid #ccc",
            boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0d47a1")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
      </div>
 
      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: "#ffcccc",
            color: "#a00",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            boxShadow: "0 1px 3px rgba(160,0,0,0.3)",
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          Error: {error}
        </div>
      )}
 
      <div
        style={{
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          maxWidth: 1050,
          margin: "0 auto",
          userSelect: "none",
          touchAction: "none",
        }}
        onPointerUp={onPointerUp}
      >
        {/* Calendar left side */}
        <div
          style={{
            flex: "0 0 700px",
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(13, 71, 161, 0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
              marginBottom: 24,
              fontWeight: "700",
              color: "#0d47a1",
              fontSize: 15,
              letterSpacing: 1,
              userSelect: "none",
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((wd) => (
              <div key={wd} style={{ textAlign: "center" }}>
                {wd}
              </div>
            ))}
 
            {weekdays.map((dateStr) => {
              const dayNum = parseInt(dateStr.slice(-2), 10);
              const bgColor = getStatusColor(dateStr);
              const isSelected = selectedDates.has(dateStr);
 
              return (
                <div
                  key={dateStr}
                  onPointerDown={() => onPointerDown(dateStr)}
                  onPointerEnter={() => onPointerEnter(dateStr)}
                  role="gridcell"
                  tabIndex={0}
                  aria-label={`Date ${dayNum}, leave status: ${
                    upcomingMap.get(dateStr) ?? "none"
                  }`}
                  style={{
                    cursor: "pointer",
                    padding: 12,
                    borderRadius: 8,
                    border: isSelected ? "3px solid #0d47a1" : "1.5px solid #ddd",
                    backgroundColor: bgColor,
                    color: "#000",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: 17,
                    boxShadow: isSelected
                      ? "0 0 8px rgba(13, 71, 161, 0.4)"
                      : "inset 0 0 5px rgba(0,0,0,0.05)",
                    userSelect: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 10px #0d47a1")}
                  onBlur={(e) =>
                    (e.currentTarget.style.boxShadow = isSelected
                      ? "0 0 8px rgba(13, 71, 161, 0.4)"
                      : "inset 0 0 5px rgba(0,0,0,0.05)")
                  }
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#d0e2ff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = bgColor;
                  }}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
 
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button
              onClick={submitLeaveRequest}
              disabled={loading || selectedDates.size === 0}
              style={{
                flex: 1,
                padding: "12px 16px",
                fontSize: 16,
                fontWeight: "600",
                borderRadius: 8,
                border: "none",
                backgroundColor: loading || selectedDates.size === 0 ? "#a0aec0" : "#0d47a1",
                color: "#fff",
                cursor: loading || selectedDates.size === 0 ? "not-allowed" : "pointer",
                boxShadow: "0 4px 10px rgba(13, 71, 161, 0.3)",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => {
                if (!(loading || selectedDates.size === 0))
                  e.currentTarget.style.backgroundColor = "#063a85";
              }}
              onMouseLeave={(e) => {
                if (!(loading || selectedDates.size === 0))
                  e.currentTarget.style.backgroundColor = "#0d47a1";
              }}
            >
              Request Leave
            </button>
            <button
              onClick={cancelLeaveRequest}
              disabled={loading || selectedDates.size === 0}
              style={{
                flex: 1,
                padding: "12px 16px",
                fontSize: 16,
                fontWeight: "600",
                borderRadius: 8,
                border: "2px solid #e53935",
                backgroundColor: "transparent",
                color: loading || selectedDates.size === 0 ? "#f9bdbb" : "#e53935",
                cursor: loading || selectedDates.size === 0 ? "not-allowed" : "pointer",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => {
                if (!(loading || selectedDates.size === 0))
                  e.currentTarget.style.color = "#ab000d";
              }}
              onMouseLeave={(e) => {
                if (!(loading || selectedDates.size === 0))
                  e.currentTarget.style.color = "#e53935";
              }}
            >
              Cancel Leave
            </button>
          </div>
        </div>
 
        {/* Summary right side */}
        <aside
          style={{
            flex: "1 1 320px",
            backgroundColor: "#fff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            fontSize: 15,
            color: "#333",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
          aria-label="Leave summary and details"
        >
          <h2 style={{ fontWeight: "700", marginTop: 0, fontSize: "1.4rem", color: "#0d47a1" }}>
            Summary
          </h2>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 10, marginBottom: 20 }}>
            <li style={{ marginBottom: 8 }}>
              <strong>Approved days:</strong>{" "}
              <span style={{ color: "#4caf50", fontWeight: "600" }}>{approvedDays}</span>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>Pending approval:</strong>{" "}
              <span style={{ color: "#ffb300", fontWeight: "600" }}>{pendingDays}</span>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>Rejected days:</strong>{" "}
              <span style={{ color: "#f44336", fontWeight: "600" }}>{rejectedDays}</span>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong>Remaining allowance:</strong>{" "}
              <span style={{ fontWeight: "600" }}>{remaining}</span>
            </li>
          </ul>
 
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: 12, color: "#0d47a1" }}>
            Upcoming Leave
          </h3>
          {upcomingLeave.length === 0 ? (
            <p
              style={{
                fontStyle: "italic",
                color: "#777",
                paddingLeft: 12,
                borderLeft: "3px solid #ccc",
                marginBottom: 20,
              }}
            >
              No upcoming leave.
            </p>
          ) : (
            <ul
              style={{
                maxHeight: 220,
                overflowY: "auto",
                paddingLeft: 20,
                marginBottom: 20,
                borderLeft: "3px solid #0d47a1",
              }}
            >
              {upcomingLeave.map(({ date, approval_status }) => (
                <li
                  key={date}
                  style={{
                    marginBottom: 8,
                    fontWeight: "600",
                    color:
                      approval_status === "approved"
                        ? "#4caf50"
                        : approval_status === "pending_approval"
                        ? "#ffb300"
                        : "#f44336",
                  }}
                >
                  {date} — {approval_status.replace("_", " ")}
                </li>
              ))}
            </ul>
          )}
 
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: 12, color: "#0d47a1" }}>
            Selected Dates
          </h3>
          {selectedDates.size === 0 ? (
            <p
              style={{
                fontStyle: "italic",
                color: "#777",
                paddingLeft: 12,
                borderLeft: "3px solid #ccc",
              }}
            >
              No dates selected.
            </p>
          ) : (
            <ul
              style={{
                maxHeight: 220,
                overflowY: "auto",
                paddingLeft: 20,
                borderLeft: "3px solid #0d47a1",
              }}
            >
              {Array.from(selectedDates)
                .sort()
                .map((date) => (
                  <li key={date} style={{ marginBottom: 6 }}>
                    {date}
                  </li>
                ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
