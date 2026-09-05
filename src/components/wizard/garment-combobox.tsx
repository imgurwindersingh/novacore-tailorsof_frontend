"use client";

import { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { GARMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function GarmentCombobox({
  value,
  onChange,
  ariaInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaInvalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  const trimmed = query.trim();
  const showCustom =
    trimmed.length > 0 &&
    !GARMENT_TYPES.some((g) => g.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid || undefined}
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className={value ? "truncate" : "truncate text-muted-foreground"}>
          {value || "Select garment…"}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-56 p-0">
        <Command>
          <CommandInput
            placeholder="Search or type a name…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            <CommandGroup>
              {GARMENT_TYPES.map((garment) => (
                <CommandItem key={garment} value={garment} onSelect={pick}>
                  {garment}
                </CommandItem>
              ))}
              {showCustom ? (
                <CommandItem
                  value={`use-custom-${trimmed}`}
                  onSelect={() => pick(trimmed)}
                >
                  <Plus className="size-4" /> Use &quot;{trimmed}&quot;
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
