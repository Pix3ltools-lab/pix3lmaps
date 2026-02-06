import Dexie, { type EntityTable } from 'dexie';
import type { MindMapData } from '@/types';

const db = new Dexie('Pix3lMapsDB') as Dexie & {
  maps: EntityTable<MindMapData, 'id'>;
};

db.version(1).stores({
  maps: '++id, name, createdAt, updatedAt',
});

export { db };
