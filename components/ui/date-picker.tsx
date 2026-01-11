"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type PropsType = {
  date?: string;
  onChange?: (date: string) => void;
  disabled?: boolean;
};

export const DatePicker = ({ date = undefined, onChange, disabled = false }: PropsType) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateObj = useMemo(() => {
    if (date) {
      return new Date(date);
    }
    // For SSR and fallback, use a safe date
    return new Date(0); // Unix epoch
  }, [date]);

  // On client mount, show today's date if no date provided
  const finalDateObj = useMemo(() => {
    if (!mounted) return dateObj;
    return !date ? new Date() : dateObj;
  }, [mounted, date, dateObj]);

  const handleChange = (d: Date | null) => {
    if (d) {
      const isoStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      onChange?.(isoStr);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Prevent any typing, allow navigation keys for calendar
    if (!/^(Tab|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape)$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // if (!mounted) {
  //   // Render a simple fallback during SSR
  //   return (
  //     <div className="relative h-[42px] w-full">
  //       <div className="w-full h-[42px] bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-between text-gray-400 text-sm">
  //         Select date
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative w-full">
      <div className="react-datepicker-wrapper w-full h-[42px] rounded-md border border-gray-200 ring-1 ring-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-gray-300 flex items-center">
        <ReactDatePicker
          selected={finalDateObj}
          onChange={handleChange}
          disabled={disabled}
          dateFormat="dd MMM yyyy"
          placeholderText="Select date"
          onKeyDown={handleKeyDown}
          className="w-full h-[42px] px-3  bg-white text-sm text-gray-800 focus:outline-none cursor-pointer flex items-center"
          wrapperClassName="w-full h-[42px] flex items-center"
        />
      </div>
      <style jsx>{`
        :global(.react-datepicker__input-container input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: none;
          font-size: 0.875rem;
          background: white;
          caret-color: transparent;
        }

        :global(.react-datepicker__input-container input:focus) {
          outline: none;
          border: none;
        }

        :global(.react-datepicker-popper) {
          z-index: 50;
        }

        :global(.react-datepicker) {
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-family: inherit;
        }

        :global(.react-datepicker__header) {
          background-color: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.75rem;
        }

        :global(.react-datepicker__day--selected) {
          background-color: #4f46e5;
        }

        :global(.react-datepicker__day--selected:hover) {
          background-color: #4338ca;
        }

        :global(.react-datepicker__day--keyboard-selected) {
          background-color: #e0e7ff;
        }

        :global(.react-datepicker__day:hover) {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default DatePicker;
