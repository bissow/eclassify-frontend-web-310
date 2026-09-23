"use client";
import { useState } from "react";
import { CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "@/lang/useTranslation";

const CustomFieldCombobox = ({
  id,
  name,
  translated_name,
  values = [],
  translated_value = [],
  value,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const items = values.map((val, i) => ({
    value: val,
    label: translated_value[i] || val,
  }));

  const selectedLabel = items.find((item) => item.value === value)?.label;
  const displayName = translated_name || name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal outline-hidden focus:outline-hidden"
        >
          <span className="truncate">
            {selectedLabel || `${t("select")} ${displayName}`}
          </span>
          <CaretUpDownIcon className="ml-2 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder={`${t("search")} ${displayName}...`} />
          <CommandList>
            <CommandEmpty>{`${t("no")} ${displayName} ${t("found")}`}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  keywords={[item.label]}
                  onSelect={(val) => {
                    onValueChange(val);
                    setOpen(false);
                  }}
                >
                  <span className="wrap-break-word">{item.label}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto shrink-0",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                    weight="bold"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomFieldCombobox;
