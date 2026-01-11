"use client";

import { useState } from "react";
import PatientForm from "./patient-form";

export default function PatientsManager() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <PatientForm />
      </div>
    </div>
  );
}
