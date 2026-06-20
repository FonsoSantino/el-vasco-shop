"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Wind } from "lucide-react";

interface FlavorManagerProps {
  defaultValue?: string; // Comma-separated
}

const FLAVOR_PRESETS = [
  "Watermelon Ice",
  "Strawberry Ice",
  "Mango Ice",
  "Blueberry Ice",
  "Peach Ice",
  "Grape Ice",
  "Lychee Ice",
  "Blue Razz",
  "Cherry Cola",
  "Mint",
  "Miami Mint",
  "Cool Mint",
  "Passion Fruit",
  "Pineapple Ice",
  "Kiwi Watermelon",
  "Berry Mix",
];

export function FlavorManager({ defaultValue = "" }: FlavorManagerProps) {
  const [flavors, setFlavors] = useState<string[]>(() =>
    defaultValue
      ? defaultValue
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0)
      : []
  );
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFlavor = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (flavors.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    setFlavors((prev) => [...prev, trimmed]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const removeFlavor = (index: number) => {
    setFlavors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFlavor(inputValue);
    } else if (e.key === "Backspace" && !inputValue && flavors.length > 0) {
      setFlavors((prev) => prev.slice(0, -1));
    }
  };

  const addPreset = (preset: string) => {
    if (!flavors.some((f) => f.toLowerCase() === preset.toLowerCase())) {
      setFlavors((prev) => [...prev, preset]);
    }
  };

  const unusedPresets = FLAVOR_PRESETS.filter(
    (p) => !flavors.some((f) => f.toLowerCase() === p.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Hidden input that sends all flavors joined */}
      <input type="hidden" name="flavors" value={flavors.join(", ")} />

      {/* Header */}
      <div className="flex items-center gap-2">
        <Wind className="w-4 h-4 text-gold" />
        <label className="text-sm font-bold text-white/80">
          Sabores disponibles
        </label>
        <span className="ml-auto text-xs text-white/30 font-medium">
          {flavors.length} {flavors.length === 1 ? "sabor" : "sabores"}
        </span>
      </div>

      {/* Chips area + input */}
      <div
        className="min-h-[56px] w-full bg-black/50 border border-white/10 rounded-xl px-3 py-3 flex flex-wrap gap-2 items-center cursor-text focus-within:border-gold transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {flavors.map((flavor, i) => (
          <span
            key={flavor + i}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold"
          >
            {flavor}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFlavor(i);
              }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-gold/30 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={flavors.length === 0 ? "Escribe un sabor y presiona Enter…" : "Agregar más…"}
          className="flex-1 min-w-[160px] bg-transparent text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
        />

        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => addFlavor(inputValue)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-black text-xs font-bold hover:bg-gold/80 transition-colors"
          >
            <Plus className="w-3 h-3" /> Agregar
          </button>
        )}
      </div>

      <p className="text-[11px] text-white/25 -mt-1">
        Presiona <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/40 text-[10px]">Enter</kbd> o{" "}
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/40 text-[10px]">,</kbd> para agregar cada sabor.
      </p>

      {/* Preset suggestions */}
      {unusedPresets.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Sugerencias rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {unusedPresets.slice(0, 10).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addPreset(preset)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/50 text-xs font-medium hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all duration-200"
              >
                <Plus className="w-3 h-3" />
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview of what gets stored */}
      {flavors.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <p className="text-[10px] text-white/20 font-mono break-all">
            Guardando: {flavors.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
