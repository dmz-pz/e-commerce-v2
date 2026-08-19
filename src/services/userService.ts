import { apiClient } from "./apiClient.ts";

export const userService = {
  checkAvailability: async (params: { cedula?: string; phone?: string; email?: string }) => {
    const query = new URLSearchParams();
    if (params.cedula) query.append("cedula", params.cedula);
    if (params.phone) query.append("phone", params.phone);
    if (params.email) query.append("email", params.email);

    return apiClient.get<{ status: string; message: string; issues?: { path: string[]; message: string }[] }>(`/api/users/check?${query.toString()}`);
  },
};
