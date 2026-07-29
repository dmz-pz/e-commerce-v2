import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, UserPlus, Filter, ShieldAlert, Trash2, ArrowRightLeft, Shield, Mail, Phone, Calendar } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Role, User } from '../../types';
import { StaffCreateModal } from './StaffCreateModal';

export function StaffTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pedir todos los usuarios o filtrar (el backend los devuelve ordenados por fecha)
      const data = await adminService.getUsers();
      // Filtrar en cliente solo para no mostrar a CLIENTE ni ADMINISTRADOR por defecto
      // (a menos que se quiera administrar administradores, pero nos enfocamos en STAFF)
      const staffMembers = Array.isArray(data) 
        ? data.filter(u => u.role === Role.STAFF_PICKER || u.role === Role.DELIVERY)
        : [];
      setUsers(staffMembers);
    } catch (err) {
      setError("No se pudo cargar la lista del personal.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: Role) => {
    const newRole = currentRole === Role.STAFF_PICKER ? Role.DELIVERY : Role.STAFF_PICKER;
    if (window.confirm(`¿Estás seguro de cambiar el rol de este empleado a ${newRole}?`)) {
      try {
        await adminService.updateUserRole(userId, newRole);
        fetchUsers();
      } catch (err) {
        alert("Ocurrió un error al intentar cambiar el rol.");
      }
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (window.confirm(`ALERTA: ¿Estás completamente seguro de querer DAR DE BAJA a ${name}?\nEsta acción le revocará el acceso al sistema.`)) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        alert("Ocurrió un error al dar de baja al empleado.");
      }
    }
  };

  // Filtrado de la lista en memoria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = 
        user.firstName.toLowerCase().includes(search.toLowerCase()) || 
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.cedula.toLowerCase().includes(search.toLowerCase());
      
      const matchRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const getRoleBadge = (role: string) => {
    if (role === Role.DELIVERY) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Shield className="w-3.5 h-3.5" /> Repartidor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Users className="w-3.5 h-3.5" /> Armador
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Gestión de Personal
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Administra los accesos y roles del equipo operativo.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="w-5 h-5" />
            Dar de Alta Empleado
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o cédula..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="ALL">Todos los Roles</option>
              <option value={Role.STAFF_PICKER}>Armadores (Pickers)</option>
              <option value={Role.DELIVERY}>Repartidores</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Empleado</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Rol Asignado</th>
                <th className="px-6 py-4 font-medium">Ingreso</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                      Cargando personal...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg">No se encontraron empleados</p>
                    <p className="text-sm">Ajusta los filtros de búsqueda o da de alta un nuevo empleado.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold shadow-inner">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            C.I: {user.cedula}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(user.createdAt).toLocaleDateString('es-VE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          title="Cambiar Rol"
                          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                          title="Dar de Baja"
                          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffCreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
    </div>
  );
}
