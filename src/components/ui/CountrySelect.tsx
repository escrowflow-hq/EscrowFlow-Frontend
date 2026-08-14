"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, countryFlag, getCountryByCode } from "@/constants/countries";
import { cn } from "@/lib/utils";

export function CountrySelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (code: string) => void;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = getCountryByCode(value);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  function open() {
    setQuery("");
    setIsOpen(true);
  }

  function select(code: string) {
    onChange(code);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-line p-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className={cn(!selected && "text-ink-muted")}>
          {selected ? `${countryFlag(selected.code)} ${selected.name}` : "Select a country"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          <input
            autoFocus
            aria-label="Search countries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries…"
            className="w-full border-b border-line p-3 text-sm focus-visible:outline-none"
          />
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {results.length === 0 && <li className="px-3 py-2 text-sm text-ink-secondary">No matches</li>}
            {results.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.code === value}
                  onClick={() => select(c.code)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface",
                    c.code === value && "bg-primary-light text-primary"
                  )}
                >
                  <span aria-hidden="true">{countryFlag(c.code)}</span>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
