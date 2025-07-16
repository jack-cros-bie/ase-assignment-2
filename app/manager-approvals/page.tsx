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

export default function ManagerApprovalPage() {

  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [AnnualLeaveRecords, setAnnualLeaveRecords] = useState<AnnualLeaveRecord[]>([]);


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
      const apiUrl = `/api/manager-approvals/GetAnnualLeaveRequests?e=something&managerId=${managerId}`; 

      console.log(apiUrl);

      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => setAnnualLeaveRecords(data)) // use setAnnualLeaveRecords
        .catch((err) => console.error("Failed to load annual leave records:", err));
    }
  }, [currentUser]); // Add currentUser as a dependency to this useEffect

//   const approvals = [
//   {
//     id: 'EMP001',
//     type: 'Annual Leave',
//     date: '2025-07-15',
//     description: 'Requesting annual leave for personal reasons.'
//   },
//   {
//     id: 'EMP002',
//     type: 'Time Sheet',
//     date: '2025-07-12',
//     description: 'Submitting updated hours for project X.'
//   },
//   // Add more approvals here
// ];

const approvals = AnnualLeaveRecords.map((leaveRecord) => ({
  id: leaveRecord.userid,
  type: "Annual Leave",
  date: leaveRecord.date,
  description: leaveRecord.description,
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

      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {approvals.map((approval, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-6 text-sm">
                <p><strong>Employee:</strong> {approval.id}</p>
                <p><strong>Request Type:</strong> {approval.type}</p>
                <p><strong>Key Information:</strong> {approval.date}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Check className="text-green-600" /></Button>
                <Button variant="outline"><X className="text-red-600" /></Button>
              </div>
            </div>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer">View Description</summary>
              <p className="mt-1">{approval.description}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

