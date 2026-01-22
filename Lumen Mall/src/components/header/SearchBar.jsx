import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Add these
import styles from './SearchBar.module.css'

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleSearch = (e) => {
        e.preventDefault();
        
        const newParams = new URLSearchParams(searchParams);
        
        if (query.trim()) {
            newParams.set('search', query);
        } else {
            newParams.delete('search');
        }

        navigate(`/?${newParams.toString()}`);
    };

    return(
        <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
                className={styles.searchInput}
                type="text"
                placeholder="Search Lumen Mall..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
                <img src="/icons/icons-search.png" alt="search-icon" />            
            </button>
        </form>
    )
}

export default SearchBar;