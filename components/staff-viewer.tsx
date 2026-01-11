"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function StaffViewer() {
  const supabase = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const [patients, setPatients] = useState<
    Record<
      string,
      {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        dob?: string;
        gender?: string;
        address?: string;
        preferredLanguage?: string;
        nationality?: string;
        emergencyName?: string;
        emergencyRelation?: string;
        religion?: string;
        status?: string;
        lastSeen?: string;
      }
    >
  >({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    supabase.current = createClient();

    try {
      channelRef.current = supabase.current.channel("patient-form");

      channelRef.current
        .on("broadcast", { event: "form_update" }, (msg: any) => {
          const payload = msg?.payload ?? msg;
          const id = payload?.patientId ?? payload?.id;
          const data = payload?.data ?? (payload?.firstName ? payload : null);
          if (id && data) {
            setPatients((s) => ({ ...s, [id]: { ...(s[id] ?? {}), ...data } }));
            setUpdatedAt(new Date().toLocaleTimeString());
          }
        })
        .on("broadcast", { event: "status_update" }, (msg: any) => {
          const payload = msg?.payload ?? msg;
          const id = payload?.patientId ?? payload?.id;
          const status = payload?.status;
          if (id && status) {
            setPatients((s) => ({
              ...s,
              [id]: {
                ...(s[id] ?? {}),
                status,
                lastSeen: new Date().toLocaleTimeString(),
              },
            }));
            setUpdatedAt(new Date().toLocaleTimeString());
          }
        })
        .subscribe();
    } catch (e) {}

    return () => {
      try {
        channelRef.current?.unsubscribe();
      } catch {}
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:shadow-lg sm:p-6">
      <div className="flex flex-col space-y-6">
        {Object.keys(patients).length === 0 && (
          <div className="text-sm border sm:border-0 rounded-xl sm:rounded-none p-2 py-5 sm:p-0 text-muted-foreground">
            No patient data yet
          </div>
        )}


        {Object.entries(patients).map(([id, pdata], index) => (
          <div
            key={id}
            className="bg-white dark:bg-slate-900/60 border rounded-lg p-4 w-full shadow-sm transition-all duration-300 ease-in-out"
          >
            <div className="flex sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                Patient {index + 1}
              </div>
              <div className="flex items-center gap-2">
                {pdata.status === "typing" && (
                  <span className="text-[11px] px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                    Typing…
                  </span>
                )}
                {pdata.status === "submitted" && (
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Submitted
                  </span>
                )}
                {pdata.status === "idle" && (
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    Idle
                  </span>
                )}
                {!pdata.status && (
                  <span className="text-[11px] px-2 py-0.5 bg-transparent text-muted-foreground">
                    —
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-6 overflow-hidden transition-all duration-300 ease-in-out">
              {/* Personal */}
              <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">Personal Information</div>
                    <div className="text-xs text-muted-foreground">
                      Basic personal details
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">First Name</div>
                    <div className="font-medium">{pdata.firstName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Middle Name
                    </div>
                    <div className="font-medium">{pdata.middleName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Last Name</div>
                    <div className="font-medium">{pdata.lastName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">{pdata.dob || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Gender</div>
                    <div className="font-medium">{pdata.gender || "—"}</div>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">Contact Information</div>
                    <div className="text-xs text-muted-foreground">
                      Phone, email and address
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="font-medium">{pdata.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-medium">{pdata.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Preferred Language
                    </div>
                    <div className="font-medium">
                      {pdata.preferredLanguage || "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground">Nationality</div>
                  <div className="font-medium">{pdata.nationality || "—"}</div>
                </div>
              </section>

              {/* Address */}
              <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">Address</div>
                    <div className="text-xs text-muted-foreground">
                      Street address and area
                    </div>
                  </div>
                </div>
                <div className="text-sm">{pdata.address || "—"}</div>
              </section>

              {/* Additional */}
              <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">Additional Information</div>
                    <div className="text-xs text-muted-foreground">
                      Optional details
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Religion</div>
                    <div className="font-medium">{pdata.religion || "—"}</div>
                  </div>
                </div>
              </section>

              {/* Emergency */}
              <section className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">Emergency Contact</div>
                    <div className="text-xs text-muted-foreground">
                      Optional
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  {pdata.emergencyName
                    ? `${pdata.emergencyName} (${
                        pdata.emergencyRelation || "—"
                      })`
                    : "—"}
                </div>
              </section>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
