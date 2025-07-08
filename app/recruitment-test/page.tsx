"use client";


import React, { useState } from 'react';

interface JobAdvert {
  id: number;
  title: string;
  salary: string;
  location: string;
  description: string;
}

const jobAdverts: JobAdvert[] = [
  { id: 1, title: 'Job Advert 1', salary: '£40,000', location: 'London', description: 'Brief description of job 1' },
  { id: 2, title: 'Job Advert 2', salary: '£45,000', location: 'Manchester', description: 'Brief description of job 2' },
  { id: 3, title: 'Job Advert 3', salary: '£50,000', location: 'Birmingham', description: 'Brief description of job 3' },
  { id: 4, title: 'Job Advert 4', salary: '£60,000', location: 'Leeds', description: 'Brief description of job 4' },
];

const RecruitmentPortal: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobAdvert | null>(null);
  const [shareJob, setShareJob] = useState<JobAdvert | null>(null);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <button className="border p-2 text-xl rounded hover:bg-gray-200">{'←'}</button>
        <h1 className="text-3xl font-bold text-center flex-1">Streamline Corp – Recruitment Portal</h1>
        <div className="border w-20 h-20 flex items-center justify-center rounded bg-white shadow">Logo</div>
      </div>

      <div className="space-y-6">
        {jobAdverts.map((job) => (
          <div key={job.id} className="flex border rounded shadow bg-white overflow-hidden">
            <div
              className="flex-1 p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedJob(job)}
            >
              <h2 className="font-semibold text-lg mb-1">{job.title}</h2>
              <p className="text-sm text-gray-700"><strong>Salary:</strong> {job.salary}</p>
              <p className="text-sm text-gray-700"><strong>Location:</strong> {job.location}</p>
              <p className="text-sm text-gray-600 mt-1">{job.description}</p>
            </div>
            <div
              className="w-32 flex flex-col items-center justify-center border-l cursor-pointer hover:bg-gray-100 text-center px-2"
              onClick={() => setShareJob(job)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 100-6 3 3 0 000 6zM21 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              </svg>
              <span className="text-xs font-medium leading-tight">Share this advert</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button className="border px-8 py-3 text-lg bg-white hover:bg-gray-100 rounded shadow">Post an Advert</button>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4">{selectedJob.title}</h2>
            <p className="mb-2"><strong>Salary:</strong> {selectedJob.salary}</p>
            <p className="mb-2"><strong>Location:</strong> {selectedJob.location}</p>
            <p>{selectedJob.description}</p>
            <button className="mt-6 px-4 py-2 border rounded hover:bg-gray-100" onClick={() => setSelectedJob(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4">Share {shareJob.title}</h2>
            <p>Choose how to share this job advert:</p>
            <ul className="mt-4 space-y-2">
              <li><button className="text-blue-600 hover:underline">Share via Email</button></li>
              <li><button className="text-blue-600 hover:underline">Share on LinkedIn</button></li>
              <li><button className="text-blue-600 hover:underline">Copy Link</button></li>
            </ul>
            <button className="mt-6 px-4 py-2 border rounded hover:bg-gray-100" onClick={() => setShareJob(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPortal;
