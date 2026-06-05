import api from '@/lib/axios';
import type { User, UserPublic } from '@/types';

export async function getMe(): Promise<User> {
  const res = await api.get<User>('/v1/users/me');
  return res.data;
}

export async function searchUsers(q: string): Promise<UserPublic[]> {
  const res = await api.get<UserPublic[]>('/v1/users/search', {
    params: { q },
  });
  return res.data;
}
