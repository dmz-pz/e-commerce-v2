declare module 'odbc' {
  export function connect(connectionString: string): Promise<Connection>;
  
  export interface Connection {
    query(sql: string, parameters?: any[]): Promise<any[]>;
    close(): Promise<void>;
  }
}
