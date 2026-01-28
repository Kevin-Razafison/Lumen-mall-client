import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styles from './AddProductForm.module.css';
import { API_BASE_URL } from '../../../config';

const PRODUCT_CATEGORIES = ['Electronics', 'Smart Home', 'Wearables', 'Audio', 'Drones', 'New Arrival'];

const AddProductForm = () => {
  const { secureHeaders, fetchInventory } = useOutletContext();
  const navigate = useNavigate();

  const [featureInput, setFeatureInput] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    imageUrl: '',
    category: 'Electronics',
    features: []
  });

  // RESTORED FUNCTIONS START HERE
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setNewProduct({ ...newProduct, features: [...newProduct.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (index) => {
    setNewProduct({ ...newProduct, features: newProduct.features.filter((_, i) => i !== index) });
  };
  // RESTORED FUNCTIONS END HERE

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: secureHeaders,
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0
        }),
      });

      if (response.ok) {
        alert("Product added successfully!");
        fetchInventory();
        navigate('/admin/inventory'); 
      } else {
        const errorText = await response.text();
        alert(`Server says: ${errorText}`);
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <section className={styles.formSection}>
      <h1>Add New Product</h1>
      <form onSubmit={handleAddProduct} className={styles.productForm}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleChange}
          required
        />

        <div className={styles.featureSection}>
          <label className={styles.fieldLabel}>Product Features:</label>
          <div className={styles.featureInputGroup}>
            <input
              type="text"
              placeholder="e.g. 4K Camera"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button type="button" onClick={addFeature} className={styles.addFeatureBtn}>
              Add
            </button>
          </div>
          <div className={styles.featureChips}>
            {newProduct.features.map((feat, index) => (
              <span key={index} className={styles.chip}>
                {feat}
                <button type="button" onClick={() => removeFeature(index)}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Initial Stock:</label>
          <input
            type="number"
            name="stock"
            placeholder="0"
            value={newProduct.stock}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleChange}
          required
        />

        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Category:</label>
          <select
            name="category"
            value={newProduct.category}
            onChange={handleChange}
            className={styles.categorySelect}
            required
          >
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.fileUploadGroup}>
          <label>Product Image:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
        </div>

        {newProduct.imageUrl && (
          <div className={styles.imagePreview}>
            <img src={newProduct.imageUrl} alt="Preview" style={{ width: '80px', borderRadius: '4px' }} />
          </div>
        )}

        <button type="submit" className={styles.submitBtn}>Save Product</button>
      </form>
    </section>
  );
};

export default AddProductForm;