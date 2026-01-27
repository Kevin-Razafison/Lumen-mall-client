import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    imageUrl: user?.imageUrl || ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setFormData({
        fullName: user?.fullName || '',
        email: user?.email || '',
        imageUrl: user?.imageUrl || ''
    });
    setIsEditing(false);
    };

    const handleSave = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:8080/api/users/profile/update', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
        });

        if (response.ok) {
        const updatedData = await response.json(); 
        
        // Merge current local state with the fresh data from DB
        const updatedUser = { 
            ...user, 
            ...updatedData // This contains the new email and new token
        };

        // 1. Update React State (Immediate UI change)
        setUser(updatedUser);

        // 2. Update Local Storage (Persistence for refresh)
        localStorage.setItem('lumenUser', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        }
    } catch (err) {
        console.error("Sync error:", err);
    }
    };

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.hero} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${formData.imageUrl || 'https://via.placeholder.com/1200x450'})` }}>
        <form className={styles.content} onSubmit={handleSave}>
          <div className={styles.avatarUpload}>
             <label htmlFor="fileInput">
               <div className={styles.profileCircle} style={{backgroundImage: `url(${formData.imageUrl})`}}>
                 {!formData.imageUrl && formData.fullName.charAt(0)}
               </div>
             </label>
             {isEditing && <input id="fileInput" type="file" onChange={handleFileChange} hidden />}
          </div>

          {isEditing ? (
            <div className={styles.editFields}>
              <input 
                className={styles.editInput}
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />
              <input 
                className={styles.editInput}
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          ) : (
            <>
              <h1 className={styles.title}>{formData.fullName}</h1>
              <p className={styles.subtitle}>{formData.email}</p>
            </>
          )}

          <div className={styles.btnGroup}>
            {isEditing ? (
            <div className={styles.btnGroup}>
                <button type="submit" className={styles.shopBtn}>SAVE PROFILE</button>
                <button type="button" onClick={handleCancel} className={styles.shopBtn} style={{marginLeft: '10px', opacity: 0.7}}>CANCEL</button>
            </div>
            ) : (
            <button type="button" onClick={() => setIsEditing(true)} className={styles.shopBtn}>EDIT SETTINGS</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;