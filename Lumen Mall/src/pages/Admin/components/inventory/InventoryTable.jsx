import React from 'react';
import styles from './InventoryTable.module.css';

const InventoryTable = ({
  filteredInventory,
  editingId,
  setEditingId,
  editForm,
  setEditForm,
  handleQuickRestock,
  handleUpdateProduct,
  handleDeleteProduct,
  categories
}) => {
  return (
    <div className={styles.tableResponsive}>
    <table className={styles.inventoryTable}>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Stock</th>
          <th>Price</th>
          <th>Category</th>
          <th>Date Added</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredInventory.length > 0 ? (
          filteredInventory.map(product => (
            <tr key={product.id} className={product.stock === 0 ? styles.outOfStockRow : ''}>
              <td>
                <img
                  src={product.imageUrl || '/drone-product-image.png'}
                  alt="thumb"
                  className={styles.tableThumb}
                />
              </td>

              {/* Name Column */}
              <td>
                {editingId === product.id ? (
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                ) : (
                  product.name
                )}
              </td>

              {/* Stock Column */}
              <td>
                {editingId === product.id ? (
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) })}
                  />
                ) : (
                  <span
                    className={
                      product.stock <= 5
                        ? `${styles.lowStockText} ${product.stock === 0 ? styles.criticalStock : ''}`
                        : ''
                    }
                  >
                    {product.stock === 0 ? "OUT OF STOCK" : product.stock}
                  </span>
                )}
              </td>

              {/* Price Column */}
              <td>
                {editingId === product.id ? (
                  <div className={styles.editPriceGroup}>
                    <input
                      type="number"
                      placeholder="Regular"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Sale (Optional)"
                      value={editForm.salePrice || ''}
                      onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className={styles.priceDisplay}>
                    {product.salePrice ? (
                      <>
                        <span className={styles.originalPriceMuted}>
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <span className={styles.salePriceActive}>
                          ${Number(product.salePrice).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      `$${Number(product.price).toFixed(2)}`
                    )}
                  </div>
                )}
              </td>

              {/* Category Column */}
              <td>
                {editingId === product.id ? (
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <span className={styles.categoryBadge}>{product.category}</span>
                )}
              </td>

              {/* Date Column */}
              <td>
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
              </td>

              {/* Actions Column */}
              <td>
                <div className={styles.actionGroup}>
                  {editingId === product.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateProduct(product.id)}
                        className={styles.saveBtn}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleQuickRestock(product)}
                        className={styles.restockBtn}
                      >
                        + Stock
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditForm({
                            ...product,
                            salePrice: product.salePrice || ''
                          });
                        }}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No products found matching your criteria.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  );
};

export default InventoryTable;
