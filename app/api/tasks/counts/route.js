import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId') || '1';
  const employeeId = searchParams.get('employeeId') || '';
  const authHeader = req.headers.get('authorization') || '';
  
  if (!employeeId) {
    return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
  }

  try {
    let allTasks = [];
    const headers = {
      'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    // Fetch first page
    const firstRes = await fetch(`https://api.dyzo.ai/api/company/${companyId}/${employeeId}/tasks/?page=1&page_size=100`, { headers });
    if (!firstRes.ok) {
      throw new Error(`Failed to fetch first page: ${firstRes.status}`);
    }
    const firstData = await firstRes.json();
    allTasks = firstData.results || [];

    const count = firstData.count;
    if (count && count > 100) {
      // Parallelize remaining fetches
      const totalPages = Math.ceil(count / 100);
      const maxPagesToFetch = Math.min(totalPages, 50); // safety limit (5000 tasks)
      const fetchPromises = [];
      for (let i = 2; i <= maxPagesToFetch; i++) {
        fetchPromises.push(
          fetch(`https://api.dyzo.ai/api/company/${companyId}/${employeeId}/tasks/?page=${i}&page_size=100`, { headers })
            .then(r => r.json().catch(() => ({})))
        );
      }
      
      const remainingData = await Promise.all(fetchPromises);
      remainingData.forEach(d => {
        if (d && d.results) {
          allTasks = allTasks.concat(d.results);
        }
      });
    } else {
      // Fallback to sequential if no count provided
      let currentPage = 2;
      let nextUrl = firstData.next;
      while (nextUrl) {
        const res = await fetch(`https://api.dyzo.ai/api/company/${companyId}/${employeeId}/tasks/?page=${currentPage}&page_size=100`, { headers });
        if (!res.ok) break;
        const data = await res.json();
        allTasks = allTasks.concat(data.results || []);
        nextUrl = data.next;
        currentPage++;
      }
    }
    
    // Tally the status counts and store grouped tasks
    const statusCounts = {};
    const groupedTasks = {};
    for (const task of allTasks) {
      let rawStatus = task.taskPosition || task.status || 'Pending';
      let status = rawStatus;
      const lower = rawStatus.toLowerCase();
      if (lower.includes('not started') || lower === 'not_started_yet') status = 'Not Started Yet';
      else if (lower.includes('in progress') || lower === 'in_progress') status = 'In Progress';
      else if (lower.includes('block')) status = 'Blocked';
      else if (lower === 'pending') status = 'Pending';
      else status = rawStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Also format the task and group it
      if (!groupedTasks[status]) {
        groupedTasks[status] = [];
      }
      groupedTasks[status].push({
        id: task._id || task.id,
        title: task.taskName || task.title || task.name || 'Untitled Task',
        description: task.description || '',
        status: status,
        rawStatus: task.taskPosition,
        project_id: task.projectId || task.project_id || null,
      });
    }
    
    return NextResponse.json({ total: allTasks.length, counts: statusCounts, tasksByStatus: groupedTasks });
  } catch (err) {
    console.error('Dyzo Overall Task Counts Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
