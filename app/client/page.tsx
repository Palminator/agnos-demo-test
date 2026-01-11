"use client";

import PatientsManager from "@/components/patients-manager";
import Image from "next/image";

export default function ClientPage() {
  return (
    <main className="relative min-h-screen bg-white sm:bg-gradient-to-br sm:from-indigo-50 sm:via-sky-50 sm:to-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-3xl">
        <PatientsManager />
      </div>
    </main>
  );
}
