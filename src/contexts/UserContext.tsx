
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'trainer' | 'trainee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classId?: string;
  className?: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (newRole: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'John Trainer', email: 'trainer@example.com', role: 'trainer' },
  { id: '2', name: 'Jane Student', email: 'student@example.com', role: 'trainee', classId: '1', className: 'Web Development Basics' },
  { id: '3', name: 'Bob Learner', email: 'bob@example.com', role: 'trainee', classId: '1', className: 'Web Development Basics' },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock registration logic
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      ...(role === 'trainee' && { classId: '1', className: 'Web Development Basics' })
    };
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUserRole = (newRole: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, updateUserRole }}>
      {children}
    </UserContext.Provider>
  );
};
