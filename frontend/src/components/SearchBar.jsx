import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    await onSearch();
    setIsSearching(false);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search defects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
        aria-label="Search defects by name, mode, or description"
      />
      <button
        onClick={handleSearch}
        disabled={isSearching}
        aria-label="Start search"
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
