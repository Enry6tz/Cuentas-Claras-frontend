import api from '@/lib/axios';
import type { ApiResponse, User, UserPublic } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<ApiResponse<User>>('/users/me');
  return unwrap(res);
}

export async function searchUsers(q: string): Promise<UserPublic[]> {
  const res = await api.get<ApiResponse<UserPublic[]>>('/users/search', { params: { q } });
  return unwrap(res);
}
