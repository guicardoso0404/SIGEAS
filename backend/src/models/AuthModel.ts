import { User, UserRole } from "./UserModel"

export interface AuthLoginPayload {
    nameUser?: string,
    email: string,
    password: string
}

// export interface AuthTokenPayload {

// }

export interface AuthResponse {
    message: string,
    success: false,
    data?: {
        user: User,
        token: string
    }
}

export interface AuthJwtPayload {
    idUser: number;
    email: string;
    nameUser: string;
    password: string,
    role: UserRole;
    iat?: number;
    exp?: number;
}