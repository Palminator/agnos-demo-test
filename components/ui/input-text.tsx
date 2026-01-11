"use client";

import React, {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  forwardRef,
  ReactNode,
  useMemo,
  useState,
} from "react";

type InputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "tel"
  | "currency"
  | "snippet"
  | "date";

export type InputTextPropsType = {
  name?: string;
  value?: string;
  label?: string;
  optional?: boolean;
  optionalText?: string;
  placeholder?: string;
  helpingText?: string;
  maxLength?: number;
  type?: InputType;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  icon?: ReactNode;
  bindValue?: string | null;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  information?: ReactNode;
  error?: boolean;
  errorText?: string;
  slotLabelRight?: ReactNode;
  required?: boolean;
  className?: string;
};

const InputText = forwardRef<HTMLInputElement, InputTextPropsType>(
  (
    {
      name = "",
      label = "",
      type = "text",
      placeholder = "",
      value = "",
      helpingText = "",
      optionalText,
      maxLength,
      optional = false,
      disabled = false,
      onChange,
      onKeyUp,
      onKeyDown,
      bindValue = null,
      icon,
      onFocus,
      onBlur,
      information,
      error = false,
      errorText = "",
      slotLabelRight,
      required = false,
      className = "",
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const canToggle = useMemo(() => type === "password", [type]);

    const inputType = useMemo(() => {
      if (type === "password") return showPassword ? "text" : "password";
      if (type === "currency" || type === "snippet") return "text";
      return type;
    }, [type, showPassword]);

    const showLabel = useMemo(() => !!slotLabelRight || label.trim().length > 0, [label, slotLabelRight]);
    const showHelpingText = useMemo(() => !error && helpingText.trim().length > 0, [helpingText, error]);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      onChange?.(e);
    };

    const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
      onKeyUp?.(e);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      onKeyDown?.(e);
    };

    const toggleShow = () => setShowPassword((s) => !s);

    const baseFieldClasses = `w-full rounded border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 ${
      error ? "border-red-500 focus:ring-red-300" : "border-gray-200"
    } ${className}`;

    const renderInput = () => {
      if (bindValue == null) {
        return (
          <input
            ref={ref}
            name={name}
            type={inputType}
            placeholder={placeholder}
            defaultValue={value}
            maxLength={maxLength}
            disabled={disabled}
            onChange={handleChange}
                onKeyUp={handleKeyUp}
                onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            className={baseFieldClasses}
          />
        );
      }

      return (
        <input
          ref={ref}
          name={name}
          type={inputType}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          value={bindValue}
          onFocus={onFocus}
          onBlur={onBlur}
          className={baseFieldClasses}
        />
      );
    };

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              {label && <label className="text-sm font-medium">{label}</label>}
              {optional && (
                <span className="text-xs text-gray-500">{optionalText ?? "(optional)"}</span>
              )}
              {required && <span className="text-sm text-orange-600">*</span>}
              {information && <div className="ml-2 text-xs text-gray-400">{information}</div>}
            </div>
            {slotLabelRight && <div>{slotLabelRight}</div>}
          </div>
        )}

        <div className="relative flex items-center">
          {type === "currency" && (
            <span className="absolute left-3 text-sm text-gray-600">฿</span>
          )}

          {type === "snippet" && (
            <span className="absolute left-3 text-sm text-gray-500">#</span>
          )}

          <div className={`flex-1 ${type === "currency" || type === "snippet" ? "pl-8" : ""}`}>
            {renderInput()}
          </div>

          {icon && <div className="ml-2 text-gray-500">{icon}</div>}

          {canToggle && (
            <button
              type="button"
              onClick={toggleShow}
              className="ml-2 text-sm text-indigo-600 hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>

        {showHelpingText && <p className="mt-1 text-xs text-gray-500">{helpingText}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{errorText}</p>}
      </div>
    );
  }
);

export default InputText;
