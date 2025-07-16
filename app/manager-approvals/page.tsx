"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, X } from 'lucide-react';

interface User {
  userid: number;
  username: string;
}

interface AnnualLeaveRecord{
      userid: number;
      date: string;
      description: string;
} 

interface TimesheetRecord{
      userid: number;
      bookingcode: string;
      date: string;
      starttime: string;
      endtime: string;
}

function ApproveLeave(index: number) {
    
    console.log("Approved Annual Leave", index);
}

function RejectLeave(index: number) {
    
    console.log("Reject Annual Leave", index);
}
function ApproveTimesheet(index: number) {
    
    console.log("Approved Timesheets", index);
}
function RejectTimesheet(index: number) {
  
    console.log("Reject Timesheet", index);
}

export default function ManagerApprovalPage() {

  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [AnnualLeaveRecords, setAnnualLeaveRecords] = useState<AnnualLeaveRecord[]>([]);
  const [TimesheetRecords, setTimesheetRecords] = useState<TimesheetRecord[]>([]);


  useEffect(() => {
    // Fetch current user session
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setCurrentUser(data))
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    // Only run the manager approval fetch if currentUser is not null
    if (currentUser) {
      const managerId = currentUser.userid; // Use currentUser.userid
      
      //for some reason this stops working if i remove e=something paramater it does nothing else but allow the mangerId value to be decode as without it there it does not decode
      const annualLeaveApiUrl = `/api/manager-approvals/GetAnnualLeaveRequests/?e=something&managerId=${managerId}`; 

      console.log(annualLeaveApiUrl);

      fetch(annualLeaveApiUrl)
        .then((res) => res.json())
        .then((data) => setAnnualLeaveRecords(data)) // use setAnnualLeaveRecords
        .catch((err) => console.error("Failed to load annual leave records:", err));

      //for some reason this stops working if i remove e=something paramater it does nothing else but allow the mangerId value to be decode as without it there it does not decode
      const timesheetApiUrl = `/api/manager-approvals/GetTimeSheetRequests/?e=something&managerId=${managerId}`; 

      console.log(timesheetApiUrl);

      fetch(timesheetApiUrl)
        .then((res) => res.json())
        .then((data) => setTimesheetRecords(data)) // use setAnnualLeaveRecords
        .catch((err) => console.error("Failed to load annual leave records:", err));
    }
    }, [currentUser]); // Add currentUser as a dependency to this useEffect

  const annualLeaveApprovals = AnnualLeaveRecords.map((leaveRecord) => ({
  id: leaveRecord.userid,
  type: "Annual Leave",
  date: leaveRecord.date,
  description: leaveRecord.description,
}));

  const timesheetApprovals = TimesheetRecords.map((timesheetRecord) => ({
  id: timesheetRecord.userid,
  type: "Timesheet",
  date: timesheetRecord.date,
  bookingcode: timesheetRecord.bookingcode,
  starttime: timesheetRecord.starttime,
  endtime: timesheetRecord.endtime
}));


return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </Button>
      <div>
        {currentUser ? (
          <>
            {/* Username button leading to dashboard */}
            <div>
              <p>{currentUser.username} ID:{currentUser.userid}</p>
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
        <img src="/media/logo.png" alt="Company Logo" className="h-10" />
      </div>

      <details className="text-lg text-gray-600">
        <summary className="cursor-pointer">Annual Leave Approvals</summary>
          <div className="max-h-[70vh] overflow-y-auto space-y-4">
            {annualLeaveApprovals.map((annualLeaveApprovals, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-6 text-sm">
                    <p><strong>Employee:</strong> {annualLeaveApprovals.id}</p>
                    <p><strong>Request Type:</strong> {annualLeaveApprovals.type}</p>
                    <p><strong>Key Information:</strong> {annualLeaveApprovals.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => ApproveLeave(index) as any}><Check className="text-green-600" /></Button>
                    <Button variant="outline" onClick={() => RejectLeave(index) as any}><X className="text-red-600" /></Button>
                  </div>
                </div>
                <details className="text-sm text-gray-600">
                  <summary className="cursor-pointer">View Description</summary>
                  <p className="mt-1">{annualLeaveApprovals.description}</p>
                </details>
              </div>
            ))}
          </div>
      </details>

      <details className="text-lg text-gray-600">
        <summary className="cursor-pointer">Timesheet Approvals</summary>
          <div className="max-h-[70vh] overflow-y-auto space-y-4">
            {timesheetApprovals.map((timesheetApprovals, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-6 text-sm">
                    <p><strong>Employee:</strong> {timesheetApprovals.id}</p>
                    <p><strong>Request Type:</strong> {timesheetApprovals.type}</p>
                    <p><strong>Date:</strong> {timesheetApprovals.date}</p>
                    <p><strong>Start Time:</strong> {timesheetApprovals.starttime}</p>
                    <p><strong>End Time:</strong> {timesheetApprovals.endtime}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => ApproveTimesheet(index) as any}><Check className="text-green-600" /></Button>
                    <Button variant="outline" onClick={() => RejectTimesheet(index) as any}><X className="text-red-600" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </details>
    </div>
  );
};

