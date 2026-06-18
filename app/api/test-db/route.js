export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'db.json');
  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ status: 1, db: {} });
  }
  const raw = fs.readFileSync(dbPath, 'utf8');
  return NextResponse.json({ status: 1, db: JSON.parse(raw) });
}
