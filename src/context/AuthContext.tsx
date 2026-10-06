import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  users: User[];
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  toggleUserActive: (userId: string) => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  hasPermission: (permission: 'manage_users' | 'delete_items' | 'edit_stock' | 'create_po' | 'admin_settings') => boolean;
}

const STORAGE_USERS_KEY = 'aim_inventory_users';
const STORAGE_CURRENT_USER_KEY = 'aim_inventory_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      const found = users.find((u) => u.id === savedId && u.isActive);
      return found || users[0] || INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users in localStorage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, currentUser.id);
    } catch (e) {
      console.warn('Failed to save currentUser in localStorage', e);
    }
  }, [currentUser]);

  const login = (email: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.isActive) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Default to the first user or keep guest session
    const guestOrStaff = users.find((u) => u.role === 'staff' && u.isActive) || users[0];
    if (guestOrStaff) {
      setCurrentUser(guestOrStaff);
    }
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target && target.isActive) {
      setCurrentUser(target);
    }
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const toggleUserActive = (userId: string) => {
    if (userId === currentUser.id) return; // Prevent disabling self
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const hasPermission = (permission: 'manage_users' | 'delete_items' | 'edit_stock' | 'create_po' | 'admin_settings') => {
    const role = currentUser.role;
    if (role === 'admin') return true;
    if (role === 'manager') {
      return permission === 'edit_stock' || permission === 'create_po' || permission === 'delete_items';
    }
    if (role === 'staff') {
      return permission === 'edit_stock';
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        updateUserRole,
        toggleUserActive,
        addUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
