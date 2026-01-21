import React from "react";
import { useState } from "react";
import styles from './SearchBar.module.css'

const SearchBar = () => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Searching for:", query);
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
                <img src="/icons/icons-search.png" alt="seach-icon" />            
            </button>
        </form>
    )
}

export default SearchBar