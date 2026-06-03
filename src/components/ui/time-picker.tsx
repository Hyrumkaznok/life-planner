"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
});

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const clamped = Math.max(0, Math.min(1439, min));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  minTime?: string;
}

export function TimePicker({ value, onChange, label, minTime }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  // null = not actively editing; non-null = user is typing
  const [localInput, setLocalInput] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Display: local draft while typing, prop value otherwise
  const displayValue = localInput ?? value;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll selected item into view when opening
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector("[data-selected='true']");
    if (el) el.scrollIntoView({ block: "center" });
  }, [open]);

  const adjust = (deltaMins: number) => {
    const next = minutesToTime(timeToMinutes(value) + deltaMins);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalInput(raw);
    if (/^\d{2}:\d{2}$/.test(raw)) {
      const [h, m] = raw.split(":").map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(raw);
      }
    }
  };

  const handleInputBlur = () => {
    if (localInput !== null) {
      if (/^\d{1,2}:\d{2}$/.test(localInput)) {
        const [h, m] = localInput.split(":").map(Number);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const formatted = minutesToTime(h * 60 + m);
          onChange(formatted);
        }
      }
      setLocalInput(null); // clear draft — display reverts to value prop
    }
  };

  const slots = minTime
    ? TIME_SLOTS.filter((t) => timeToMinutes(t) > timeToMinutes(minTime))
    : TIME_SLOTS;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>}

      <div
        className={cn(
          "flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white transition-all cursor-pointer",
          open ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 hover:border-slate-300"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setOpen(true)}
          placeholder="00:00"
          className="flex-1 text-sm font-bold text-slate-800 bg-transparent outline-none w-12 cursor-text"
          maxLength={5}
        />
        <div className="flex flex-col gap-0 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => adjust(30)}
            className="w-5 h-4 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => adjust(-30)}
            className="w-5 h-4 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 top-full mt-1.5 left-0 w-36 bg-white border border-slate-200 rounded-2xl shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="overflow-y-auto max-h-52 py-1">
            {slots.map((slot) => {
              const isSelected = slot === value;
              const isNear = Math.abs(timeToMinutes(slot) - timeToMinutes(value)) <= 30;
              return (
                <button
                  key={slot}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => {
                    onChange(slot);
                    setLocalInput(null);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "bg-rose-500 text-white font-bold"
                      : isNear
                      ? "text-slate-700 font-medium hover:bg-slate-50"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
