"use client";

import { useState } from "react";
import PatientForm from "./patient-form";

export default function PatientsManager() {
  const [ids, setIds] = useState<string[]>([]);

  const addPatient = () => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setIds((s) => [id, ...s]);
  };

  const removePatient = (id: string) => {
    setIds((s) => s.filter((x) => x !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={addPatient}
          className="rounded bg-primary text-white px-3 py-1 text-sm"
        >
          เพิ่มผู้ป่วยใหม่
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {ids.length === 0 && (
          <div className="text-sm text-muted-foreground">ยังไม่มีฟอร์มผู้ป่วย กด "เพิ่มผู้ป่วยใหม่" เพื่อเริ่ม</div>
        )}

        {ids.map((id) => (
          <div key={id} className="border rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-muted-foreground">Patient ID: {id}</div>
              <button
                onClick={() => removePatient(id)}
                className="text-sm text-red-500"
              >
                ลบ
              </button>
            </div>
            <PatientForm patientId={id} />
          </div>
        ))}
      </div>
    </div>
  );
}
