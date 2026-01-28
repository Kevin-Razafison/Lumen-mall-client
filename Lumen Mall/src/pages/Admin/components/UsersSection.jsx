import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './UsersSection.module.css'; // Fixed import path

const UsersSection = () => {
  const { users = [], setUsers, secureHeaders, currentUserId } = useOutletContext();

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/role`, {
        method: 'PUT',
        headers: secureHeaders,
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error("Role update failed:", err);
    }
  };

  return (
    <section className={styles.inventorySection}>
      <h1>User Management</h1>
      <div className={styles.tableWrapper}>
      <table className={styles.inventoryTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>
                  <span className={u.role === 'ROLE_ADMIN' ? styles.adminBadge : styles.userBadge}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={styles.statusSelect}
                    disabled={u.id === currentUserId}
                  >
                    <option value="ROLE_USER">USER</option>
                    <option value="ROLE_ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </section>
  );
};

export default UsersSection;
