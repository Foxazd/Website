import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Gọi API hoặc tìm kiếm trong dữ liệu cục bộ
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  return (
    <div className="container mt-4">
      <h2>Kết quả tìm kiếm cho: "{query}"</h2>
      {searchResults.length > 0 ? (
        <ul>
          {searchResults.map((result, index) => (
            <li key={index}>
              <a href={`/detail/${result.id}`}>{result.title}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có kết quả nào.</p>
      )}
    </div>
  );
};

export default SearchResults;
