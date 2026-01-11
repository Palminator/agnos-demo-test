"use client";

import dynamic from "next/dynamic";

const DatePickerInner = dynamic(
  () => import("./date-picker").then((mod) => mod.DatePicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[42px] w-full bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center text-gray-400 text-sm">
        Select date
      </div>
    ),
  }
);

type PropsType = {
  date?: string;
  onChange?: (date: string) => void;
  disabled?: boolean;
};

export const DatePickerClient = (props: PropsType) => {
  return <DatePickerInner {...props} />;
};
