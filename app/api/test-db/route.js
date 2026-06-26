export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '2';
  const employeeId = searchParams.get('employeeId') || '48';
  const authHeader = req.headers.get('authorization') || '';
  
  let allTasks = [];
  let currentPage = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `https://api.dyzo.ai/api/company/${companyId}/${employeeId}/tasks/?page=${currentPage}&page_size=100`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) break;
    const data = await res.json();
    allTasks = allTasks.concat(data.results || []);
    if (data.next) {
      currentPage++;
    } else {
      hasMore = false;
    }
  }
  
  const statusCounts = {};
  for (const task of allTasks) {
    const status = task.taskPosition || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  
  return NextResponse.json({ total_fetched: allTasks.length, statuses: Object.keys(statusCounts).length, counts: statusCounts });
}
