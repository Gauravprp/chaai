const fs = require('fs');

async function fetchAllTasks() {
  let allTasks = [];
  let page = 1;
  let hasMore = true;
  const companyId = '2';
  const employeeId = '48';
  
  console.log('Fetching all tasks...');
  
  while (hasMore) {
    const url = `https://api.dyzo.ai/api/company/${companyId}/${employeeId}/tasks/?page=${page}&page_size=100`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed at page ${page}: ${res.status}`);
        break;
      }
      
      const data = await res.json();
      const results = data.results || [];
      allTasks = allTasks.concat(results);
      
      if (data.next) {
        page++;
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error(err);
      break;
    }
  }
  
  const statusCounts = {};
  for (const task of allTasks) {
    const status = task.taskPosition || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  
  fs.writeFileSync('task_counts.json', JSON.stringify({ total: allTasks.length, counts: statusCounts }, null, 2));
  console.log('Done! Total fetched:', allTasks.length);
  console.log(statusCounts);
}

fetchAllTasks();
