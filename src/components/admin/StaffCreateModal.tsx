import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { adminService } from '../../services/adminService.ts';
import { userService } from '../../services/userService.ts';
import { Role } from '../../types/index.ts';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { CedulaInput } from '../ui/CedulaInput.tsx';
import { PhoneInput } from '../ui/PhoneInput.tsx';
import { ModalFormLayout } from '../ui/ModalFormLayout.tsx';
import { PasswordInput } from '../PasswordInput.tsx';

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
    birthdate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ cedula?: string, phone?: string, email?: string, birthdate?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = async (field: 'cedula' | 'phone' | 'email' | 'birthdate', value: string) => {
    if (!value) return;

    if (field === 'birthdate') {
      const birthDateObj = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      if (age < 18) {
        setFieldErrors(prev => ({ ...prev, birthdate: 'Debes ser mayor de edad (mínimo 18 años).' }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.birthdate;
          return newErrors;
        });
      }
      return;
    }

    try {
      if (field === 'cedula' || field === 'phone' || field === 'email') {
        const check = await userService.checkAvailability({ [field]: value });
        if (check.status !== 'success') {
          setFieldErrors(prev => ({ ...prev, [field]: check.message || `Este ${field} ya está registrado` }));
        }
      }
    } catch (err: any) {
      if (err.data?.issues) {
        err.data.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0] === field) {
            setFieldErrors(prev => ({ ...prev, [field]: issue.message }));
          }
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(fieldErrors).some(err => err)) {
      setError("Por favor, corrige los errores antes de continuar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        cedula: formData.cedula,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        birthdate: formData.birthdate
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
        birthdate: '',
      });
    } catch (error) {
      const err = error as Error & { response?: { data?: { error?: string, message?: string } } };
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
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
      maxWidthClass="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cédula */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Cédula *</label>
          <div onBlur={() => handleBlur('cedula', formData.cedula)}>
            <CedulaInput
              value={formData.cedula}
              onChange={(val) => handleCustomChange('cedula', val)}
            />
          </div>
          {fieldErrors.cedula && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
              {fieldErrors.cedula}
            </motion.p>
          )}
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

        {/* Fecha de Nacimiento */}
        <div>
          <Input
            type="date"
            label="Fecha de Nac. *"
            name="birthdate"
            required
            leftIcon={<Calendar className="w-4 h-4" />}
            value={formData.birthdate}
            onChange={handleChange}
            onBlur={(e) => handleBlur('birthdate', e.target.value)}
            error={fieldErrors.birthdate}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono *</label>
          <div onBlur={() => handleBlur('phone', formData.phone)}>
            <PhoneInput
              value={formData.phone}
              onChange={(val) => handleCustomChange('phone', val)}
            />
          </div>
          {fieldErrors.phone && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-bold mt-1 px-1">
              {fieldErrors.phone}
            </motion.p>
          )}
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
            onBlur={(e) => handleBlur('email', e.target.value)}
            error={fieldErrors.email}
          />
        </div>

        {/* Contraseña */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña Temporal *</label>
          <PasswordInput
            name="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleChange}
            className="h-11 text-xs font-bold"
            iconClassName="w-4 h-4 text-slate-300"
          />
          <p className="text-xs text-gray-500 mt-1">
            Debe tener mínimo 8 caracteres, incluir una mayúscula, una minúscula y un número.
          </p>
        </div>
      </div>
    </ModalFormLayout>
  );
}
