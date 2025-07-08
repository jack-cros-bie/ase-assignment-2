// WowDisplay.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, X } from 'lucide-react';

const approvals = [
  {
    id: 'EMP001',
    type: 'Annual Leave',
    date: '2025-07-15',
    description: 'Requesting annual leave for personal reasons.'
  },
  {
    id: 'EMP002',
    type: 'Time Sheet',
    date: '2025-07-12',
    description: 'Submitting updated hours for project X.'
  },
  // Add more approvals here
];

const WowDisplay: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </Button>
        <img src="/logo.png" alt="Company Logo" className="h-10" />
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

export default WowDisplay;
