import React, { createContext, useContext, useState, useEffect } from 'react';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  role?: 'client' | 'staff' | 'picker' | 'admin' | 'delivery';
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Simulate persistent login 
  useEffect(() => {
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, _password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const demoAccounts: User[] = [
          {
            id: 'admin-1',
            name: 'Administrador de Sede',
            email: 'admin@supermercado.com',
            addresses: [],
            role: 'admin'
          },
          {
            id: 'staff-1',
            name: 'Carlos Picker',
            email: 'staff@supermercado.com',
            addresses: [],
            role: 'picker'
          },
          {
            id: 'del-1',
            name: 'Carlos Pérez',
            email: 'delivery@supermercado.com',
            addresses: [],
            role: 'delivery'
          },
          {
            id: 'client-1',
            name: 'Mateo Sanchez',
            email: 'cliente@gmail.com',
            addresses: [],
            role: 'client'
          }
        ];

        const targetEmail = email.toLowerCase().trim();
        const demoFound = demoAccounts.find(u => u.email === targetEmail);

        if (demoFound) {
          setUser(demoFound);
          localStorage.setItem('demo_user', JSON.stringify(demoFound));
          resolve();
          return;
        }

        // Simple demo logic: check local storage or use mock
        const savedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const found = savedUsers.find((u: any) => u.email.toLowerCase().trim() === targetEmail);
        
        if (found) {
          const userObj = { ...found, id: found.id || '1', role: found.role || 'client' };
          setUser(userObj);
          localStorage.setItem('demo_user', JSON.stringify(userObj));
          resolve();
        } else {
          reject(new Error('Credenciales inválidas. Prueba con: admin@supermercado.com, staff@supermercado.com o cliente@gmail.com'));
        }
      }, 800);
    });
  };

  const register = async (name: string, email: string, _password: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          addresses: [],
          role: 'client'
        };
        
        const savedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        localStorage.setItem('registered_users', JSON.stringify([...savedUsers, newUser]));
        
        setUser(newUser);
        localStorage.setItem('demo_user', JSON.stringify(newUser));
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress = { ...address, id: Math.random().toString(36).substr(2, 9) };
    const updatedUser = { ...user, addresses: [...user.addresses, newAddress] };
    setUser(updatedUser);
    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
  };

  const updateAddress = async (id: string, updatedFields: Partial<Address>) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map(addr => 
      addr.id === id ? { ...addr, ...updatedFields } : addr
    );
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(addr => addr.id !== id);
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateProfile, 
      addAddress, 
      updateAddress, 
      deleteAddress 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
