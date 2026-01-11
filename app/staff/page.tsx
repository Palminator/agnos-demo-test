"use client";

import StaffViewer from "@/components/staff-viewer";

export default function StaffPage() {
  return (
    <main className="relative min-h-screen bg-white sm:bg-gradient-to-br sm:from-indigo-50 sm:via-sky-50 sm:to-white flex items-start justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-3xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            Staff — Live Patient Data
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time user data display for staff.
          </p>
        </div>

        <StaffViewer />
      </div>
    </main>
  );
}
