import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient.ts';
import { authClient } from '../services/authClient.ts';
import { Role } from '../types/index.ts';

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
  role?: Role;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    cedula: string;
    name: string;
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

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: (data.user as any).phone,
            addresses: [],
            role: (data.user as any).role || Role.CLIENTE
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password
    });

    if (error) {
      throw new Error(error.message || 'Credenciales inválidas');
    }

    if (data && data.user) {
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: (data.user as any).phone,
        addresses: [],
        role: (data.user as any).role || Role.CLIENTE
      });
    }
  };

  const register = async (data: {
    cedula: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    birthdate?: string;
  }) => {
    const { data: resData, error } = await (authClient.signUp.email as any)({
      email: data.email,
      password: data.password,
      name: data.name,
      cedula: data.cedula,
      phone: data.phone,
      birthdate: data.birthdate,
      callbackURL: `${window.location.origin}/email-verified`
    });

    if (error) {
      throw new Error(error.message || 'Error al registrar usuario');
    }

    if (resData && resData.user) {
      setUser({
        id: resData.user.id,
        name: resData.user.name,
        email: resData.user.email,
        phone: (resData.user as any).phone,
        addresses: [],
        role: (resData.user as any).role || Role.CLIENTE
      });
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setUser(null);
    }
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
          role?: Role;
        };
      }>('auth/profile', data);

      if (res && res.user) {
        const updatedUser = {
          ...user,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role || Role.CLIENTE
        };
        setUser(updatedUser);
      }
    } catch (error) {
      const err = error as Error;
      console.warn("Falla al actualizar perfil en servidor, actualizando localmente:", err);
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress = { ...address, id: Math.random().toString(36).substr(2, 9) };
    const updatedUser = { ...user, addresses: [...user.addresses, newAddress] };
    setUser(updatedUser);
  };

  const updateAddress = async (id: string, updatedFields: Partial<Address>) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map(addr =>
      addr.id === id ? { ...addr, ...updatedFields } : addr
    );
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(addr => addr.id !== id);
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
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
