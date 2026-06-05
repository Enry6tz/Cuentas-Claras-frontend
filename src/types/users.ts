export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}
