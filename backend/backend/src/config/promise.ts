import * as mysql2 from "mysql2/promise";
import { QueryResultArray } from "../types/mysql";

// Função auxiliar para tipar os resultados das queries
export function asArray<T = any>(result: any): QueryResultArray<T> {
    return result as QueryResultArray<T>;
}

export const db = mysql2.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'meubanco',
})