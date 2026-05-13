// All Firestore tables live at __db/{table}/data
export const dbPath = (table: string) => ['__db', table, 'data'] as const;
