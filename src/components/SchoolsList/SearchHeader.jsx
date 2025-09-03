import React, { memo } from "react";
import SearchInput from "./SearchInput";

// TotalCount'u ayrı bir component yaparak gereksiz re-render'ları önlüyorum
const TotalCount = memo(({ totalCount }) => (
  <div className="flex items-center justify-end">
    <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
      Toplam {totalCount} okul
    </span>
  </div>
));

const SearchHeader = memo(({ searchTerm, onSearchChange, totalCount }) => {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />
          </div>
          <TotalCount totalCount={totalCount} />
        </div>
      </div>
    </div>
  );
});

export default SearchHeader;
