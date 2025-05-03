import React, { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [adminToken]);

  const login = (newToken) => {
    setAdminToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  return (
    <AdminContext.Provider value={{ 
      adminToken, 
      login, 
      logout 
    }}>
      {children}
    </AdminContext.Provider>
  );
};