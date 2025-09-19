import { User, UserRole } from "./UserModel"

export interface AuthLoginPayload {
    email: string,
    password: string
}

// export interface AuthTokenPayload {

// }
export interface AuthError {
    message: string;
    success: boolean;

}

export interface AuthResponse {
    message: string,
    success: boolean,
    data?: {
        user: User,
        token: string
    }
}

export interface AuthJwtPayload {
    idUser: number;
    email: string;
    userName: string;
    password: string,
    role: UserRole;
}

export interface AuthResponseSuccess {
    message: string,
    success: boolean,
    data?: User
}