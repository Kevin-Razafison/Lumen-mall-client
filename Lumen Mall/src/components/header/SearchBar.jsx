import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from './SearchBar.module.css';

const SearchBar = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('search') || '');
    const navigate = useNavigate();

    useEffect(() => {
        setQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        updateSearchURL(query);
    };

    const updateSearchURL = (value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value.trim()) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        navigate(`/?${newParams.toString()}`);
    };

    const handleClear = () => {
        setQuery('');
        updateSearchURL(''); 
    };

    return (
        <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.inputWrapper}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search Lumen Mall..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button 
                        type="button" 
                        className={styles.clearButton} 
                        onClick={handleClear}
                    >
                        ✕
                    </button>
                )}
            </div>
            <button type="submit" className={styles.searchButton}>
                <img src="/icons/icons-search.png" alt="search-icon" />            
            </button>
        </form>
    );
};

export default SearchBar;