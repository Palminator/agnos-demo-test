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
          console.log("[staff-viewer] received form_update:", msg);
          const payload = msg?.payload ?? msg;
          const id = payload?.patientId ?? payload?.id;
          const data = payload?.data ?? (payload?.firstName ? payload : null);
          if (id && data) {
            setPatients((s) => ({ ...s, [id]: { ...(s[id] ?? {}), ...data } }));
            setUpdatedAt(new Date().toLocaleTimeString());
          } else {
            console.warn(
              "[staff-viewer] form_update missing patientId or data",
              payload
            );
          }
        })
        .on("broadcast", { event: "status_update" }, (msg: any) => {
          console.log("[staff-viewer] received status_update:", msg);
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
          } else {
            console.warn(
              "[staff-viewer] status_update missing patientId or status",
              payload
            );
          }
        })
        .subscribe();
    } catch (e) {
      // ignore
    }

    return () => {
      try {
        channelRef.current?.unsubscribe();
      } catch {
        // noop
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:shadow-lg sm:p-6">
      <div className="flex flex-col space-y-6">
        {Object.keys(patients).length === 0 && (
          <div className="text-sm border sm:border-0 rounded-xl sm:rounded-none p-2 py-5 sm:p-0 text-muted-foreground">
            ยังไม่มีข้อมูลผู้ป่วยเข้ามา
          </div>
        )}

        {Object.entries(patients).map(([id, pdata], index) => (
          <div
            key={id}
            className="bg-white dark:bg-slate-900/60 border rounded-lg p-4 w-full shadow-sm transition-all duration-300 ease-in-out"
          >
            <div className="flex sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                คนไข้ {index + 1}
              </div>
              <div className="flex items-center gap-2">
                {pdata.status === "typing" && (
                  <span className="text-[11px] px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                    กำลังพิมพ์…
                  </span>
                )}
                {pdata.status === "submitted" && (
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    ส่งแล้ว
                  </span>
                )}
                {pdata.status === "idle" && (
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    ไม่ตอบสนอง
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
                    <div className="text-sm font-medium">ข้อมูลส่วนตัว</div>
                    <div className="text-xs text-muted-foreground">
                      Basic personal details
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">ชื่อ</div>
                    <div className="font-medium">{pdata.firstName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      ชื่อกลาง
                    </div>
                    <div className="font-medium">{pdata.middleName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">นามสกุล</div>
                    <div className="font-medium">{pdata.lastName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">วันเกิด</div>
                    <div className="font-medium">{pdata.dob || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">เพศ</div>
                    <div className="font-medium">{pdata.gender || "—"}</div>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">ข้อมูลติดต่อ</div>
                    <div className="text-xs text-muted-foreground">
                      Phone, email and address
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">เบอร์</div>
                    <div className="font-medium">{pdata.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-medium">{pdata.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      ภาษาโปรด
                    </div>
                    <div className="font-medium">
                      {pdata.preferredLanguage || "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground">สัญชาติ</div>
                  <div className="font-medium">{pdata.nationality || "—"}</div>
                </div>
              </section>

              {/* Address */}
              <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">ที่อยู่</div>
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
                    <div className="text-sm font-medium">ข้อมูลเพิ่มเติม</div>
                    <div className="text-xs text-muted-foreground">
                      Optional details
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">ศาสนา</div>
                    <div className="font-medium">{pdata.religion || "—"}</div>
                  </div>
                </div>
              </section>

              {/* Emergency */}
              <section className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium">ผู้ติดต่อฉุกเฉิน</div>
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
