import React, { useState } from 'react';
import styles from './InventorySection.module.css';
import { useOutletContext } from 'react-router-dom';
import InventoryFilters from './InventoryFilters';
import InventoryTable from './InventoryTable';

const PRODUCT_CATEGORIES = ['Electronics', 'Smart Home', 'Wearables', 'Audio', 'Drones', 'New Arrival'];

const InventorySection = () => {
  
  const { 
    inventory = [], 
    setInventory, 
    secureHeaders, 
    fetchInventory 
  } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: 0,
    features: []
  });

  const filteredInventory = inventory.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock === 0;
    const isOnSale = product.salePrice && product.salePrice < product.price;

    let matchesFilter = false;
    if (filterCategory === 'All') {
      matchesFilter = true;
    } else if (filterCategory === 'Low Stock') {
      matchesFilter = isLowStock;
    } else if (filterCategory === 'Out of Stock') {
      matchesFilter = isOutOfStock;
    } else if (filterCategory === 'On Sale') {
      matchesFilter = isOnSale;
    } else {
      matchesFilter = product.category === filterCategory;
    }

    return matchesSearch && matchesFilter;
  });


  const handleQuickRestock = async (product) => {
    const amountToAdd = window.prompt(`Restock "${product.name}"\nHow many units are you adding?`, "10");

    if (amountToAdd === null) return;

    const parsedAmount = parseInt(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    const updatedStock = (product.stock || 0) + parsedAmount;

    try {
      const response = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'PUT',
        headers: secureHeaders,
        body: JSON.stringify({
          ...product,
          stock: updatedStock
        }),
      });

      if (response.ok) {
        setInventory(inventory.map(p => p.id === product.id ? { ...p, stock: updatedStock } : p));
      } else {
        alert("Restock failed. Please try again.");
      }
    } catch (err) {
      console.error("Restock error:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE',
        headers: secureHeaders
      });
      if (response.ok) {
        setInventory(inventory.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleUpdateProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'PUT',
        headers: secureHeaders,
        body: JSON.stringify({
          ...editForm,
          price: parseFloat(editForm.price),
          salePrice: editForm.salePrice ? parseFloat(editForm.salePrice) : null,
          stock: parseInt(editForm.stock)
        }),
      });

      if (response.ok) {
        setInventory(inventory.map(p => p.id === productId ? { ...p, ...editForm } : p));
        setEditingId(null);
      } else {
        alert("Update failed. Check your data.");
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <section className={styles.inventorySection}>
      <div className={styles.inventoryHeader}>
        <h1>Product Inventory</h1>

        <InventoryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={PRODUCT_CATEGORIES}
        />
      </div>

      <InventoryTable
        filteredInventory={filteredInventory}
        editingId={editingId}
        setEditingId={setEditingId}
        editForm={editForm}
        setEditForm={setEditForm}
        handleQuickRestock={handleQuickRestock}
        handleUpdateProduct={handleUpdateProduct}
        handleDeleteProduct={handleDeleteProduct}
        categories={PRODUCT_CATEGORIES}
      />
    </section>
  );
};

export default InventorySection;
