"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  patientId: string;
};

export default function PatientForm({ patientId }: Props) {
  const supabase = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
    preferredLanguage: "",
    nationality: "",
    emergencyName: "",
    emergencyRelation: "",
    religion: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const typingTimer = useRef<number | null>(null);
  const idleTimeout = 5000;

  useEffect(() => {
    supabase.current = createClient();

    // load Thailand areas for cascading selects
    (async () => {
      try {
        const res = await fetch("/thailand-areas.json");
        if (res.ok) {
          const json = await res.json();
          setAreas(json.provinces || []);
        }
      } catch (e) {
        // ignore
      }
    })();

    // create or reuse a channel named 'patient-form'
    try {
      channelRef.current = supabase.current.channel("patient-form").subscribe();
    } catch (e) {
      // ignore if realtime not available
    }

    return () => {
      try {
        channelRef.current?.unsubscribe();
      } catch {
        // noop
      }
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, []);

  const [areas, setAreas] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<any[]>([]);

  const handleChange = (key: string, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);

    // broadcast update with patientId
    try {
      const payload = { patientId, data: next };
      channelRef.current?.send({ type: "broadcast", event: "form_update", payload });
      // send typing status and schedule idle
      channelRef.current?.send({ type: "broadcast", event: "status_update", payload: { patientId, status: "typing" } });
      console.log("[patient-form] sent update", payload);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        try {
          channelRef.current?.send({ type: "broadcast", event: "status_update", payload: { patientId, status: "idle" } });
          console.log("[patient-form] sent idle", patientId);
        } catch (e) {
          // ignore
        }
      }, idleTimeout);
    } catch (e) {
      // ignore
    }
  };

  const handleProvinceChange = (pName: string) => {
    const province = areas.find((p) => p.name === pName);
    const districts = province?.districts ?? [];
    setDistrictOptions(districts);
    setSubdistrictOptions([]);
    handleChange("province", pName);
    handleChange("district", "");
    handleChange("subdistrict", "");
    handleChange("postalCode", "");
  };

  const handleDistrictChange = (dName: string) => {
    const district = districtOptions.find((d) => d.name === dName);
    const subs = district?.subdistricts ?? [];
    setSubdistrictOptions(subs);
    handleChange("district", dName);
    handleChange("subdistrict", "");
    handleChange("postalCode", "");
  };

  const handleSubdistrictChange = (sName: string) => {
    const sub = subdistrictOptions.find((s) => s.name === sName);
    const pcode = sub?.postal_code ?? "";
    handleChange("subdistrict", sName);
    handleChange("postalCode", pcode);
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.firstName.trim()) nextErrors.firstName = "ต้องระบุชื่อ";
    if (!form.lastName.trim()) nextErrors.lastName = "ต้องระบุนามสกุล";
    if (!form.dob) nextErrors.dob = "ต้องระบุวันเกิด";
    if (!form.gender) nextErrors.gender = "ต้องเลือกเพศ";
    if (!form.phone.trim()) nextErrors.phone = "ต้องระบุเบอร์โทร";
    else {
      const phoneRe = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRe.test(form.phone)) nextErrors.phone = "รูปแบบเบอร์ไม่ถูกต้อง";
    }
    if (!form.email.trim()) nextErrors.email = "ต้องระบุอีเมล";
    else {
      const emailRe = /^\S+@\S+\.\S+$/;
      if (!emailRe.test(form.email)) nextErrors.email = "อีเมลไม่ถูกต้อง";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { patientId, data: form };
      channelRef.current?.send({ type: "broadcast", event: "form_update", payload });
      channelRef.current?.send({ type: "broadcast", event: "status_update", payload: { patientId, status: "submitted" } });
      console.log("[patient-form] submitted", payload);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    } catch (e) {
      // ignore
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm mb-1">ชื่อ *</label>
        <input
          value={form.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        {errors.firstName && <div className="text-xs text-red-600 mt-1">{errors.firstName}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">ชื่อกลาง (option)</label>
        <input
          value={form.middleName}
          onChange={(e) => handleChange("middleName", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">นามสกุล</label>
        <input
          value={form.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Email *</label>
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">วันเกิด *</label>
        <input
          type="date"
          value={form.dob}
          onChange={(e) => handleChange("dob", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        {errors.dob && <div className="text-xs text-red-600 mt-1">{errors.dob}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">เพศ *</label>
        <select
          value={form.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="">-- เลือก --</option>
          <option value="female">หญิง</option>
          <option value="male">ชาย</option>
          <option value="other">อื่น ๆ</option>
        </select>
        {errors.gender && <div className="text-xs text-red-600 mt-1">{errors.gender}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">เบอร์ *</label>
        <input
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">ที่อยู่ (รายละเอียดถนน / หมายเลข)</label>
        <textarea
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">จังหวัด *</label>
        <select
          value={form.province}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="">-- เลือกจังหวัด --</option>
          {areas.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.province && <div className="text-xs text-red-600 mt-1">{errors.province}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">อำเภอ *</label>
        <select
          value={form.district}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className="w-full rounded border px-3 py-2"
          disabled={districtOptions.length === 0}
        >
          <option value="">-- เลือกอำเภอ --</option>
          {districtOptions.map((d: any) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.district && <div className="text-xs text-red-600 mt-1">{errors.district}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">ตำบล *</label>
        <select
          value={form.subdistrict}
          onChange={(e) => handleSubdistrictChange(e.target.value)}
          className="w-full rounded border px-3 py-2"
          disabled={subdistrictOptions.length === 0}
        >
          <option value="">-- เลือกตำบล --</option>
          {subdistrictOptions.map((s: any) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.subdistrict && <div className="text-xs text-red-600 mt-1">{errors.subdistrict}</div>}
      </div>

      <div>
        <label className="block text-sm mb-1">รหัสไปรษณีย์</label>
        <input value={form.postalCode} readOnly className="w-full rounded border px-3 py-2 bg-gray-50" />
      </div>

      <div>
        <label className="block text-sm mb-1">ภาษาโปรด</label>
        <input
          value={form.preferredLanguage}
          onChange={(e) => handleChange("preferredLanguage", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">สัญชาติ</label>
        <input
          value={form.nationality}
          onChange={(e) => handleChange("nationality", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">ฉุกเฉิน (ชื่อ)</label>
        <input
          value={form.emergencyName}
          onChange={(e) => handleChange("emergencyName", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">ความสัมพันธ์ (ฉุกเฉิน)</label>
        <input
          value={form.emergencyRelation}
          onChange={(e) => handleChange("emergencyRelation", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">ศาสนา (option)</label>
        <input
          value={form.religion}
          onChange={(e) => handleChange("religion", e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <div className="text-xs text-muted-foreground mt-2">id: {patientId}</div>
      <div className="flex gap-2 mt-3">
        <button type="submit" className="rounded bg-emerald-600 text-white px-3 py-1 text-sm">Submit</button>
      </div>
    </form>
  );
}
