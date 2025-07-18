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
      leaveentryid: number;
      userid: number;
      firstname: string;
      surname: string;
      date: string;
      description: string;
} 

interface TimesheetRecord{
      timesheetentryid: number;
      userid: number;
      firstname: string;
      surname: string;
      bookingcode: string;
      date: string;
      starttime: string;
      endtime: string;
}

async function UpdateLeave(leaveentryid: Number, approved: boolean)
{
  try
  {
    var response;
    if(approved)
    {
      response = await fetch(`/api/manager-approvals/ApproveAnnualLeave/?e=something&leaveentryid=${leaveentryid}`, 
      {
        method: 'POST',
      });
    }
    else
    {
      response = await fetch(`/api/manager-approvals/RejectAnnualLeave/?e=something&leaveentryid=${leaveentryid}`, 
      {
        method: 'POST',
      });
    }

    const data = await response.json();
    return data;
  }
  catch (error) 
  {
    console.error('Error updating leave entry:', error);
    throw error;
  }
}

async function UpdateTimesheetApproval(timesheetentryid: Number, approved: boolean)
{
  try
  {
    var response;
    if(approved)
    {
      response = await fetch(`/api/manager-approvals/ApproveTimesheet/?e=something&leaveentryid=${timesheetentryid}`, 
      {
        method: 'POST',
      });
    }
    else
    {
      response = await fetch(`/api/manager-approvals/RejectTimesheet/?e=something&leaveentryid=${timesheetentryid}`, 
      {
        method: 'POST',
      });
    }

    const data = await response.json();
    return data;
  }
  catch (error) 
  {
    console.error('Error updating timesheet entry:', error);
    throw error;
  }
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
    leaveentryid: leaveRecord.leaveentryid,
    userid: leaveRecord.userid,
    firstname: leaveRecord.firstname,
    surname: leaveRecord.surname,
    type: "Annual Leave",
    date: leaveRecord.date,
    description: leaveRecord.description,
}));

  const timesheetApprovals = TimesheetRecords.map((timesheetRecord) => ({
    timesheetentryid: timesheetRecord.timesheetentryid,
    userid: timesheetRecord.userid,
    firstname: timesheetRecord.firstname,
    surname: timesheetRecord.surname,
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
                    <p><strong>Employee:</strong> {annualLeaveApprovals.firstname} {annualLeaveApprovals.surname}</p>
                    <p><strong>Request Type:</strong> {annualLeaveApprovals.type}</p>
                    <p><strong>Key Information:</strong> {annualLeaveApprovals.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => UpdateLeave(annualLeaveApprovals.leaveentryid, true) as any}><Check className="text-green-600" /></Button>
                    <Button variant="outline" onClick={() => UpdateLeave(annualLeaveApprovals.leaveentryid, false) as any}><X className="text-red-600" /></Button>
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
                    <p><strong>Employee:</strong> {timesheetApprovals.firstname} {timesheetApprovals.surname}</p>
                    <p><strong>Request Type:</strong> {timesheetApprovals.type}</p>
                    <p><strong>Date:</strong> {timesheetApprovals.date}</p>
                    <p><strong>Start Time:</strong> {timesheetApprovals.starttime}</p>
                    <p><strong>End Time:</strong> {timesheetApprovals.endtime}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => UpdateTimesheetApproval(timesheetApprovals.timesheetentryid, true) as any}><Check className="text-green-600" /></Button>
                    <Button variant="outline" onClick={() => UpdateTimesheetApproval(timesheetApprovals.timesheetentryid, false) as any}><X className="text-red-600" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </details>
    </div>
  );
};

