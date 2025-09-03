import React, { memo } from "react";
import FormField from "@/components/FormTemplate/FormField";

const SearchInput = memo(({ searchTerm, onSearchChange }) => {
  return (
    <FormField
      type="text"
      placeholder="Okul ara..."
      value={searchTerm}
      onChange={onSearchChange}
      icon="search"
      delay={0}
    />
  );
});

export default SearchInput;
