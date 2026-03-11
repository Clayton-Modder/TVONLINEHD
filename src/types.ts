import { Channel } from './constants';

export interface Folder {
  id: string;
  name: string;
  channelIds: string[];
}

export interface User {
  id: string;
  username: string;
  profileImage: string;
  favorites: string[];
  folders: Folder[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}
