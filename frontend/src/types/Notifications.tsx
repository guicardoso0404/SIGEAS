import type { UserRole } from "./Usertypes";

interface Notice {
  idNotice: number;
  audience: UserRole | 'all';
  title: string;
  message: string;
  createdAt: string;
}

export type { Notice}