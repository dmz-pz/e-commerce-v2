import React, { useState } from 'react';
import { X, UserPlus, Shield, Mail, Phone, Lock, CreditCard } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Role } from '../../types';

interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StaffCreateModal({ isOpen, onClose, onSuccess }: StaffCreateModalProps) {
  const [formData, setFormData] = useState({
    cedula: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    role: Role.STAFF_PICKER,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await adminService.createStaff(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        cedula: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        role: Role.STAFF_PICKER,
      });
    } catch (error) {
      const err = error as Error & { response?: { data?: { error?: string } } };
      // Manejar error estructurado
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Ocurrió un error al registrar al empleado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Alta de Personal</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <div className="mt-0.5"><Shield className="w-4 h-4" /></div>
              <p>{error}</p>
            </div>
          )}

          <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Cédula</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="V-12345678"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Rol Asignado</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  >
                    <option value={Role.STAFF_PICKER}>Armador (Picker)</option>
                    <option value={Role.DELIVERY}>Repartidor (Motorizado)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Nombres</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Ej. Juan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Apellidos</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="0414-0000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="staff-form"
            disabled={isLoading}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registrando...
              </>
            ) : (
              'Crear Empleado'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
