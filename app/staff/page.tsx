"use client";

import StaffViewer from "@/components/staff-viewer";

export default function StaffPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Staff — Live Patient Data</h1>
        <p className="text-sm text-muted-foreground mb-6">
          หน้าจอเจ้าหน้าที่ จะแสดงข้อมูลที่ผู้ใช้กรอกแบบเรียลไทม์
        </p>
        <StaffViewer />
      </div>
    </main>
  );
}
