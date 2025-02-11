"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export const MultiSelectCombobox = ({
  items = [],
  selectedIds = [],
  onSelectionChange,
  placeholder,
  searchPlaceholder = "Search...",
  getItemId = (item) => item.id, // Default to `item.id` for unique identifier
  getItemLabel = (item) => item.username, // Default to `item.username` for label
  noItemsMessage = "No items found."
}) => {
  const [selectedUsers, setSelectedUsers] = useState(new Set(selectedIds));

  useEffect(() => {
    setSelectedUsers(new Set(selectedIds));
  }, [selectedIds]);

  const handleToggle = (id) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onSelectionChange(Array.from(newSet)); // Update parent component
      return newSet;
    });
  };

  const validItems = items.filter((item) => {
    const id = getItemId(item);
    if (!id) {
      console.warn("Item missing ID:", item);
      return false;
    }
    return true;
  });

  const selectedLabels = Array.from(selectedUsers)
    .map((id) => validItems.find((item) => getItemId(item) === id))
    .filter(Boolean)
    .map(getItemLabel)
    .join(", ");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedUsers.size ? selectedLabels : placeholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            {validItems.length > 0 ? (
              validItems.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedUsers.has(id);

                return (
                  <CommandItem key={`user-${id}`} className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(id)}
                      className="mr-2"
                    />
                    {getItemLabel(item)}
                  </CommandItem>
                );
              })
            ) : (
              <p key="no-items" className="text-sm text-gray-500 p-2">
                {noItemsMessage}
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
