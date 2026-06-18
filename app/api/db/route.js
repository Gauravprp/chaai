import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

// Helper to read DB
function readDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}));
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

// Helper to write DB
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function POST(req) {
  try {
    const { action, table, payload, filters } = await req.json();
    const db = readDb();
    const records = db[table] || [];

    let result = null;

    if (action === 'select') {
      let filtered = [...records];
      if (filters && filters.length > 0) {
        filters.forEach(({ column, value }) => {
          filtered = filtered.filter((r) => r[column] === value);
        });
      }
      
      // Resolve joins
      if (table === 'messages' || table === 'leave_requests') {
        const profiles = db['profiles'] || [];
        filtered = filtered.map((item) => {
          const profile = profiles.find((p) => p.id === item.user_id) || { name: 'User' };
          return { ...item, profiles: profile };
        });
      }

      result = filtered;
    } 
    else if (action === 'insert' || action === 'upsert') {
      const toInsert = Array.isArray(payload) ? payload : [payload];
      const inserted = toInsert.map((item) => ({
        id: item.id || `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));

      let updated = [...records];
      inserted.forEach((item) => {
        const idx = updated.findIndex((r) => r.id === item.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], ...item };
        } else {
          updated.push(item);
        }
      });

      db[table] = updated;
      writeDb(db);
      result = Array.isArray(payload) ? inserted : inserted[0];
    }
    else if (action === 'update') {
      let updated = [...records];
      let matched = [];
      updated = updated.map((r) => {
        const match = filters.every(({ column, value }) => r[column] === value);
        if (match) {
          const record = { ...r, ...payload };
          matched.push(record);
          return record;
        }
        return r;
      });
      db[table] = updated;
      writeDb(db);
      result = matched;
    }
    else if (action === 'delete') {
      let updated = [];
      let deleted = [];
      records.forEach((r) => {
        const match = filters.every(({ column, value }) => r[column] === value);
        if (match) {
          deleted.push(r);
        } else {
          updated.push(r);
        }
      });
      db[table] = updated;
      writeDb(db);
      result = deleted;
    }

    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    console.error("Local JSON DB API error:", err);
    return NextResponse.json({ data: null, error: err.message }, { status: 500 });
  }
}
