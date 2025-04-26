import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

function SearchBar({ searchTerm, setSearchTerm, onSearch }) {
  const handleInputChange = useCallback(
    (e) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault(); // Prevent default form submission
      onSearch();
    },
    [onSearch]
  );

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <input
        id="search-input"
        type="text"
        value={searchTerm}
        placeholder="Search by name, mode, or description..."
        onChange={handleInputChange}
      />
      <button type="submit">Search</button>
    </form>
  );
}

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;