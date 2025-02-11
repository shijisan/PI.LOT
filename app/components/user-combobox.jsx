"use client";

import { MultiSelectCombobox } from "./multi-select-combobox";

export const UserCombobox = ({ 
  users, 
  selectedUserIds, 
  onSelectionChange 
}) => {
  return (
    <MultiSelectCombobox
      items={users}
      selectedIds={selectedUserIds}
      onSelectionChange={onSelectionChange}
      placeholder="Select Users"
      searchPlaceholder="Search users..."
      getItemId={(user) => user.id}
      getItemLabel={(user) => user.username}
      noItemsMessage="No users found."
    />
  );
};