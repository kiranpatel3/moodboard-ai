export interface ConnectionRecord {
  id: string;
  fromId: string;
  toId: string;
  description: string;
}

const connections = new Map<string, ConnectionRecord>();

export function getConnection(id: string): ConnectionRecord | undefined {
  return connections.get(id);
}

export function upsertConnectionDescription(
  id: string,
  description: string,
): ConnectionRecord {
  const existing = connections.get(id);

  if (existing) {
    existing.description = description;
    return existing;
  }

  const connection: ConnectionRecord = {
    id,
    fromId: '',
    toId: '',
    description,
  };

  connections.set(id, connection);
  return connection;
}
