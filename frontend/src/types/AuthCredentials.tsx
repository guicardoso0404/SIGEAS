import type { User } from "./Usertypes";

interface AuthCredentials {
    email: string;
    password: string
}

export type { AuthCredentials }

interface AuthResponse {
    token: string;
    user: User;
}
interface AuthError {
    message: string;
    status: number;

}

export type { AuthResponse, AuthError}