// Tipo para auxiliar na tipagem dos resultados de consultas MySQL
export type QueryResultRow = { [key: string]: any };
export type QueryResultArray<T = QueryResultRow> = Array<T>;