import React, { useEffect, useMemo, useRef, useState } from "react";

export type DropdownItemType<T extends { value?: unknown } = { value?: string }> = {
  id: string;
  label: string;
  description?: string;
} & T;

type Props<T extends { value?: unknown } = { value?: string }> = {
  items: DropdownItemType<T>[];
  value?: DropdownItemType<T> | null;
  placeholder?: string;
  position?: "upper" | "lower";
  onSelect?: (item: DropdownItemType<T>) => void;
  className?: string;
  label?: string;
  information?: React.ReactNode;
  slotLabelRight?: React.ReactNode;
  optional?: boolean;
  height?: number;
  error?: boolean;
};

const styles = {
  container: "w-full",
  labelRow: "flex items-center justify-between mb-1",
  labelLeft: "flex items-center gap-2",
  labelText: "text-sm font-medium text-gray-700",
  optionalText: "text-xs text-orange-500 ml-1",
  wrapper: "relative w-full",
  selected: "w-full bg-white border border-gray-200 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer hover:ring-1 hover:ring-gray-200",
  itemListBase: "absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto z-50",
  item: "px-3 py-2 hover:bg-gray-50 cursor-pointer",
  noItem: "px-3 py-2 text-sm text-gray-500",
  icon: "ml-2 text-gray-400",
  info: "text-xs text-gray-500",
  upper: "bottom-full mb-1",
  lower: "top-full mt-1",
};

export const Dropdown = <T extends { value?: unknown } = { value?: string }>(
  props: Props<T>
) => {
  const {
    items,
    value = null,
    placeholder = "",
    label = "",
    optional = false,
    position = "lower",
    onSelect,
    className = "",
    information,
    slotLabelRight,
    height,
    error = false,
  } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<DropdownItemType<T> | null>(value || null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (value && value.id !== selected?.id) {
      setSelected(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (item: DropdownItemType<T>) => {
    setSelected(item);
    onSelect?.(item);
    setOpen(false);
  };

  const toggleDropdown = () => setOpen((s) => !s);

  const showLabel = useMemo(() => label.trim().length > 0, [label]);

  const positionClass = position === "upper" ? styles.upper : styles.lower;

  const menuStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (height) return { maxHeight: `${height}px` };
    return undefined;
  }, [height]);

  return (
    <div className={`${styles.container} ${className}`}>
      {showLabel && (
        <div className={styles.labelRow}>
          <div className={styles.labelLeft}>
            <div className={styles.labelText}>
              {label}
              {optional ? <span className={styles.optionalText}>*</span> : null}
            </div>
            {information ? <div className={styles.info}>{information}</div> : null}
          </div>
          {slotLabelRight ? <div>{slotLabelRight}</div> : null}
        </div>
      )}

      <div className={styles.wrapper} ref={ref}>
        <div className={`${styles.selected} ${error ? 'border-red-500' : ''}`} onClick={toggleDropdown} role="button" tabIndex={0}>
          <div className={`flex-1 truncate ${!selected ? 'text-slate-400' : ''}`}>{selected?.label ?? placeholder}</div>
          <div className={styles.icon} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div
          className={`${styles.itemListBase} ${open ? "block" : "hidden"} ${positionClass}`.trim()}
          style={menuStyle}
        >
          {items.length === 0 ? (
            <div className={`${styles.item} ${styles.noItem}`}>{"ไม่มีตัวเลือก"}</div>
          ) : (
            items.map((item) => (
              <div
                key={`dd-${item.id}`}
                className={styles.item}
                onClick={() => handleSelect(item)}
                role="button"
                tabIndex={0}
              >
                <div className="font-medium text-gray-800">{item.label}</div>
                {item.description ? <div className="text-sm text-gray-500">{item.description}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
