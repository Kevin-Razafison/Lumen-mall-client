import React from 'react';
import styles from './InventoryFilters.module.css';

const InventoryFilters = ({ searchTerm, setSearchTerm, filterCategory, setFilterCategory, categories }) => {
  return (
    <div className={styles.filterControls}>
      <input
        type="text"
        placeholder="Search by name..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className={styles.categoryFilter}
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="All">All Categories</option>
        <optgroup label="Product Categories">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </optgroup>
        <optgroup label="Inventory Status">
          <option value="Low Stock">Low Stock (≤ 5)</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="On Sale">Items on Sale</option>
        </optgroup>
      </select>
    </div>
  );
};

export default InventoryFilters;
