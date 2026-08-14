import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Phone, Lock, CreditCard } from 'lucide-react';
import { adminService } from '../../services/adminService.ts';
import { Role } from '../../types/index.ts';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { ModalFormLayout } from '../ui/ModalFormLayout.tsx';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        cedula: formData.cedula,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      await adminService.createStaff(payload);
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
    <ModalFormLayout
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Alta de Personal"
      subtitle="Registrar nuevo empleado"
      icon={<UserPlus className="w-5 h-5" />}
      formError={error || ""}
      isMutating={isLoading}
      submitText="Crear Empleado"
      showCancelButton={true}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cédula */}
        <div>
          <Input
            label="Cédula *"
            name="cedula"
            placeholder="V-12345678"
            required
            leftIcon={<CreditCard className="w-4 h-4" />}
            value={formData.cedula}
            onChange={handleChange}
          />
        </div>

        {/* Rol */}
        <div>
          <Select
            label="Rol Asignado *"
            name="role"
            leftIcon={<Shield className="w-4 h-4" />}
            value={formData.role}
            onChange={handleChange}
          >
            <option value={Role.STAFF_PICKER}>Armador (Picker)</option>
            <option value={Role.DELIVERY}>Repartidor (Motorizado)</option>
          </Select>
        </div>

        {/* Nombres */}
        <div>
          <Input
            label="Nombres *"
            name="firstName"
            placeholder="Ej. Juan"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        {/* Apellidos */}
        <div>
          <Input
            label="Apellidos *"
            name="lastName"
            placeholder="Ej. Pérez"
            required
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <Input
            type="email"
            label="Correo Electrónico *"
            name="email"
            placeholder="correo@empresa.com"
            required
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Teléfono */}
        <div>
          <Input
            type="tel"
            label="Teléfono *"
            name="phone"
            placeholder="0414-0000000"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Contraseña */}
        <div>
          <Input
            type="password"
            label="Contraseña de Acceso *"
            name="password"
            placeholder="••••••••"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>
    </ModalFormLayout>
  );
}
