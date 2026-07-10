import { apiClient } from "@/api/client";
import type { ApiResponse, LoginResponse } from "@/types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>("/api/auth/login", {
    email,
    password,
  });
  return res.data.data as LoginResponse;
}
