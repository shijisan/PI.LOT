"use client";

import { MultiSelectCombobox } from "./multi-select-combobox";

export const LabelCombobox = ({ 
  labels, 
  selectedLabelIds, 
  onSelectionChange 
}) => {
  return (
    <MultiSelectCombobox
      items={labels}
      selectedIds={selectedLabelIds}
      onSelectionChange={onSelectionChange}
      placeholder="Select Labels"
      searchPlaceholder="Search labels..."
      getItemId={(label) => label.id}
      getItemLabel={(label) => label.name}
      noItemsMessage="No labels found."
    />
  );
};