"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  patientId?: string;
};

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function PatientForm({ patientId }: Props) {
  const [currentId, setCurrentId] = useState<string>(patientId ?? "");
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
    // If no id was passed, generate one on the client after mount.
    if (!currentId) {
      setCurrentId(makeId());
    }

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
  // Autocomplete UI state for address fields
  const [provinceSuggestions, setProvinceSuggestions] = useState<string[]>([]);
  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);
  const [provinceIndex, setProvinceIndex] = useState(-1);

  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);
  const [districtIndex, setDistrictIndex] = useState(-1);

  const [subdistrictSuggestions, setSubdistrictSuggestions] = useState<
    string[]
  >([]);
  const [showSubdistrictSuggestions, setShowSubdistrictSuggestions] =
    useState(false);
  const [subdistrictIndex, setSubdistrictIndex] = useState(-1);

  const allProvinces = () => areas.map((p) => p.name);
  const allDistricts = () =>
    areas.flatMap((p) => (p.districts || []).map((d: any) => d.name));
  const allSubdistricts = () =>
    areas.flatMap((p) =>
      (p.districts || []).flatMap((d: any) =>
        (d.subdistricts || []).map((s: any) => s.name)
      )
    );

  const selectProvinceSuggestion = (name: string) => {
    handleChange("province", name);
    const province = areas.find((a) => a.name === name);
    const districts = province?.districts ?? [];
    setDistrictOptions(districts);
    setSubdistrictOptions([]);
    setShowProvinceSuggestions(false);
    setProvinceIndex(-1);
  };

  const selectDistrictSuggestion = (name: string) => {
    handleChange("district", name);
    // find district under selected province first, otherwise search all
    const province = areas.find((a) => a.name === form.province);
    let subs: any[] = [];
    if (province) {
      const d = (province.districts || []).find((x: any) => x.name === name);
      subs = d?.subdistricts ?? [];
    } else {
      // search globally
      for (const a of areas) {
        const d = (a.districts || []).find((x: any) => x.name === name);
        if (d) {
          subs = d.subdistricts ?? [];
          break;
        }
      }
    }
    setSubdistrictOptions(subs);
    setShowDistrictSuggestions(false);
    setDistrictIndex(-1);
  };

  const selectSubdistrictSuggestion = (name: string) => {
    handleChange("subdistrict", name);
    // try to set postal code if available
    for (const a of areas) {
      for (const d of a.districts || []) {
        const s = (d.subdistricts || []).find((x: any) => x.name === name);
        if (s && s.postal_code) {
          handleChange("postalCode", s.postal_code);
          break;
        }
      }
    }
    setShowSubdistrictSuggestions(false);
    setSubdistrictIndex(-1);
  };

  const handleChange = (key: string, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);

    // broadcast update with currentId
    try {
      const payload = { patientId: currentId, data: next };
      channelRef.current?.send({
        type: "broadcast",
        event: "form_update",
        payload,
      });
      // send typing status and schedule idle
      channelRef.current?.send({
        type: "broadcast",
        event: "status_update",
        payload: { patientId: currentId, status: "typing" },
      });
      console.log("[patient-form] sent update", payload);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        try {
          channelRef.current?.send({
            type: "broadcast",
            event: "status_update",
            payload: { patientId: currentId, status: "idle" },
          });
          console.log("[patient-form] sent idle", currentId);
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
      const payload = { patientId: currentId, data: form };
      channelRef.current?.send({
        type: "broadcast",
        event: "form_update",
        payload,
      });
      channelRef.current?.send({
        type: "broadcast",
        event: "status_update",
        payload: { patientId: currentId, status: "submitted" },
      });
      console.log("[patient-form] submitted", payload);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);

      // reset form state and generate new id for next patient
      setForm({
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
      setErrors({});
      setDistrictOptions([]);
      setSubdistrictOptions([]);
      setCurrentId(makeId());
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl sm:shadow-lg sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Patient Information Form</h2>
            <p className="text-sm text-muted-foreground">
              Please fill out all required fields to complete your registration
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <div className="text-sm font-medium">Personal Information</div>
                <div className="text-xs text-muted-foreground">
                  Basic personal details
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">
                  First Name <span className="text-orange-600">*</span>
                </label>
                <input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
                {errors.firstName && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Middle Name</label>
                <input
                  placeholder="Middle name (optional)"
                  value={form.middleName}
                  onChange={(e) => handleChange("middleName", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Last Name <span className="text-orange-600">*</span>
                </label>
                <input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
                {errors.lastName && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-sm mb-1">
                  Date of Birth <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    placeholder="YYYY-MM-DD"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="w-full rounded border px-3 py-2 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v7H4V8z" />
                    </svg>
                  </div>
                </div>
                {errors.dob && (
                  <div className="text-xs text-red-600 mt-1">{errors.dob}</div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Gender <span className="text-orange-600">*</span>
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.gender}
                  </div>
                )}
              </div>

              <div />
            </div>
          </section>

          {/* Contact Information */}
          <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <div className="text-sm font-medium">Contact Information</div>
                <div className="text-xs text-muted-foreground">
                  Phone, email and address
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">
                  Phone Number <span className="text-orange-600">*</span>
                </label>
                <input
                  placeholder="e.g. +66 812345678"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
                {errors.phone && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Email Address <span className="text-orange-600">*</span>
                </label>
                <input
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
                {errors.email && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div />
            </div>

            <div className="mt-3">
              <label className="block text-sm mb-1">Street address</label>
              <textarea
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address, building, floor, unit..."
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mt-3">
              <div className="relative">
                <label className="block text-sm mb-1">Province</label>
                <input
                  placeholder="Province"
                  value={form.province}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleChange("province", v);
                    const suggestions = allProvinces()
                      .filter((n) => n.toLowerCase().includes(v.toLowerCase()))
                      .slice(0, 6);
                    setProvinceSuggestions(suggestions);
                    setShowProvinceSuggestions(true);
                    setProvinceIndex(-1);
                    // if exact match, populate districts
                    const province = areas.find((a) => a.name === v);
                    setDistrictOptions(province?.districts ?? []);
                    setSubdistrictOptions([]);
                  }}
                  onKeyDown={(e) => {
                    if (!showProvinceSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setProvinceIndex((i) =>
                        Math.min(i + 1, provinceSuggestions.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setProvinceIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (provinceIndex >= 0)
                        selectProvinceSuggestion(
                          provinceSuggestions[provinceIndex]
                        );
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowProvinceSuggestions(false), 150)
                  }
                  className="w-full rounded border px-3 py-2"
                />
                {showProvinceSuggestions && provinceSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 mt-1 z-50 bg-white border rounded shadow max-h-48 overflow-auto">
                    {provinceSuggestions.map((s, idx) => (
                      <li
                        key={s}
                        onMouseDown={() => selectProvinceSuggestion(s)}
                        className={`px-3 py-2 cursor-pointer ${
                          idx === provinceIndex ? "bg-gray-100" : ""
                        }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm mb-1">District</label>
                <input
                  placeholder="District"
                  value={form.district}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleChange("district", v);
                    // suggestions from selected province or globally
                    const candidates = (
                      form.province
                        ? areas.find((a) => a.name === form.province)
                            ?.districts || []
                        : areas.flatMap((a) => a.districts || [])
                    ).map((d: any) => d.name);
                    const suggestions = candidates
                      .filter((n: string) =>
                        n.toLowerCase().includes(v.toLowerCase())
                      )
                      .slice(0, 6);
                    setDistrictSuggestions(suggestions);
                    setShowDistrictSuggestions(true);
                    setDistrictIndex(-1);
                    // set subdistrictOptions when exact match
                    const province = areas.find(
                      (a) => a.name === form.province
                    );
                    const dObj = province
                      ? (province.districts || []).find(
                          (x: any) => x.name === v
                        )
                      : null;
                    if (dObj) setSubdistrictOptions(dObj.subdistricts || []);
                  }}
                  onKeyDown={(e) => {
                    if (!showDistrictSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setDistrictIndex((i) =>
                        Math.min(i + 1, districtSuggestions.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setDistrictIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (districtIndex >= 0)
                        selectDistrictSuggestion(
                          districtSuggestions[districtIndex]
                        );
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowDistrictSuggestions(false), 150)
                  }
                  className="w-full rounded border px-3 py-2"
                />
                {showDistrictSuggestions && districtSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 mt-1 z-50 bg-white border rounded shadow max-h-48 overflow-auto">
                    {districtSuggestions.map((s, idx) => (
                      <li
                        key={s}
                        onMouseDown={() => selectDistrictSuggestion(s)}
                        className={`px-3 py-2 cursor-pointer ${
                          idx === districtIndex ? "bg-gray-100" : ""
                        }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm mb-1">Subdistrict</label>
                <input
                  placeholder="Subdistrict"
                  value={form.subdistrict}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleChange("subdistrict", v);
                    // candidates from selected district or global
                    let candidates: string[] = [];
                    if (form.province && form.district) {
                      const province = areas.find((a) => a.name === form.province);
                      const d = province?.districts?.find((x: any) => x.name === form.district);
                      candidates = (d?.subdistricts || []).map((s: any) => s.name);
                    } else {
                      candidates = allSubdistricts();
                    }
                    const suggestions = candidates.filter((n) => n.toLowerCase().includes(v.toLowerCase())).slice(0, 6);
                    setSubdistrictSuggestions(suggestions);
                    setShowSubdistrictSuggestions(true);
                    setSubdistrictIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (!showSubdistrictSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSubdistrictIndex((i) => Math.min(i + 1, subdistrictSuggestions.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSubdistrictIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (subdistrictIndex >= 0) selectSubdistrictSuggestion(subdistrictSuggestions[subdistrictIndex]);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSubdistrictSuggestions(false), 150)}
                  className="w-full rounded border px-3 py-2"
                />
                {showSubdistrictSuggestions && subdistrictSuggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 mt-1 z-50 bg-white border rounded shadow max-h-48 overflow-auto">
                    {subdistrictSuggestions.map((s, idx) => (
                      <li key={s} onMouseDown={() => selectSubdistrictSuggestion(s)} className={`px-3 py-2 cursor-pointer ${idx === subdistrictIndex ? "bg-gray-100" : ""}`}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm mb-1">Postcode</label>
                <input
                  placeholder="Postal code"
                  value={form.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <div className="text-sm font-medium">
                  Additional Information
                </div>
                <div className="text-xs text-muted-foreground">
                  Optional details
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Preferred Language</label>
                <input
                  placeholder="e.g. Thai, English"
                  value={form.preferredLanguage}
                  onChange={(e) =>
                    handleChange("preferredLanguage", e.target.value)
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Nationality</label>
                <input
                  placeholder="Nationality"
                  value={form.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Religion</label>
                <input
                  placeholder="Religion"
                  value={form.religion}
                  onChange={(e) => handleChange("religion", e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="p-4 border rounded-lg transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <div className="text-sm font-medium">Emergency Contact</div>
                <div className="text-xs text-muted-foreground">Optional</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  placeholder="Emergency contact full name"
                  value={form.emergencyName}
                  onChange={(e) =>
                    handleChange("emergencyName", e.target.value)
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Relationship</label>
                <input
                  placeholder="Relationship"
                  value={form.emergencyRelation}
                  onChange={(e) =>
                    handleChange("emergencyRelation", e.target.value)
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2 rounded-full shadow"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
