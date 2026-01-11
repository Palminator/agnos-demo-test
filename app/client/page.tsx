"use client";

import PatientsManager from "@/components/patients-manager";

export default function ClientPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Client — Patient Forms</h1>
        <p className="text-sm text-muted-foreground mb-6">
          สร้างฟอร์มผู้ป่วยได้หลายรายการ ข้อมูลจะถูกส่งแบบเรียลไทม์แยกตามรหัสผู้ป่วย
        </p>
        <PatientsManager />
      </div>
    </main>
  );
}
