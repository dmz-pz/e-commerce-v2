import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient.ts';

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
  register: (data: {
    cedula: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    birthdate?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Validar sesión inicial con el backend
  useEffect(() => {
    const fetchMe = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await apiClient.get<{
            user: {
              id: string;
              name: string;
              email: string;
              phone?: string;
              role?: string;
            };
          }>('auth/me');
          
          if (res && res.user) {
            const userObj: User = {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              phone: res.user.phone,
              addresses: [],
              role: (res.user.role?.toLowerCase() as any) || 'client'
            };
            setUser(userObj);
            localStorage.setItem('demo_user', JSON.stringify(userObj));
          }
        } catch (err) {
          console.error("Error al validar sesión con backend, limpiando credenciales:", err);
          logout();
        }
      } else {
        const savedUser = localStorage.getItem('demo_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{
      status: string;
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        role?: string;
      };
    }>('auth/login', { email, password });

    if (res && res.token) {
      localStorage.setItem('token', res.token);
      const userObj: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        addresses: [],
        role: (res.user.role?.toLowerCase() as any) || 'client'
      };
      setUser(userObj);
      localStorage.setItem('demo_user', JSON.stringify(userObj));
    } else {
      throw new Error('No se recibió el token de autenticación');
    }
  };

  const register = async (data: {
    cedula: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    birthdate?: string;
  }) => {
    // 1. Llamar a la API del backend para registrarse de forma segura
    await apiClient.post<{ status: string; user: any }>('auth/register', data);
    // 2. Loguearse automáticamente usando las credenciales recién creadas
    await login(data.email, data.password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await apiClient.patch<{
        user: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          role?: string;
        };
      }>('auth/profile', data);
      
      if (res && res.user) {
        const updatedUser = { 
          ...user, 
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          role: (res.user.role?.toLowerCase() as any) || 'client'
        };
        setUser(updatedUser);
        localStorage.setItem('demo_user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      console.warn("Falla al actualizar perfil en servidor, actualizando localmente:", err);
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('demo_user', JSON.stringify(updatedUser));
    }
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
