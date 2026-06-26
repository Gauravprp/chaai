import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req) {
  try {
    const taskData = await req.json();
    
    // Convert to FormData as required by Dyzo API
    const formData = new FormData();
    formData.append('taskName', taskData.taskName);
    formData.append('description', taskData.description || '');
    let projectId = taskData.projectId;

    if (!projectId && taskData.assigned_users && taskData.assigned_users.length > 0) {
      try {
        const assignedUserId = taskData.assigned_users[0];
        const projectRes = await fetch(`https://api.dyzo.ai/project/company/1/${assignedUserId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
          }
        });
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          const projectsList = projectData.projects || projectData.results || projectData.data || [];
          const untitledProject = projectsList.find(p => p.name && (p.name.toLowerCase() === 'untitled' || p.name.toLowerCase() === 'untitled project'));
          if (untitledProject) {
            projectId = (untitledProject._id || untitledProject.id).toString();
          }
        }
      } catch (e) {
        console.warn("Could not fetch Untitled project fallback:", e);
      }
    }

    if (projectId) {
      formData.append('projectId', projectId);
    }
    
    // Defaults for required Dyzo fields
    formData.append('priority', 'medium');
    formData.append('taskPosition', 'pending');
    
    // Add assigned users
    if (taskData.assigned_users && taskData.assigned_users.length > 0) {
      taskData.assigned_users.forEach(id => {
        formData.append('assigned_users[]', id);
      });
    }

    // Add collaborators
    if (taskData.collaborators && taskData.collaborators.length > 0) {
      taskData.collaborators.forEach(id => {
        formData.append('collaborators[]', id);
      });
    }

    const assignbyId = taskData.assignby_id;
    if (!assignbyId) {
       return NextResponse.json({ error: 'Missing assignby_id' }, { status: 400 });
    }

    const dyzoResponse = await fetch(`https://api.dyzo.ai/create-task/${assignbyId}/`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
      },
      body: formData,
    });

    if (!dyzoResponse.ok) {
      const errorText = await dyzoResponse.text();
      throw new Error(`Dyzo API Error: ${dyzoResponse.status} ${errorText}`);
    }

    const data = await dyzoResponse.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Dyzo Task Creation Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
       return NextResponse.json({ error: "Missing employeeId parameter" }, { status: 400 });
    }

    let cleanEmployeeId = employeeId;
    if (employeeId && employeeId.includes('-')) {
      const parts = employeeId.split('-');
      if (parts[1] === '0000' && parts[2] === '0000' && parts[3] === '0000') {
        const match = parts[0].match(/^([1-9][0-9]*|0)0*$/);
        if (match) {
          cleanEmployeeId = match[1];
        }
      }
    }

    // Forward the authorization header if present, otherwise fallback to API key
    const authHeader = req.headers.get('authorization') || '';
    
    // Using the official api/company/<company_id>/<employee_id>/tasks/ endpoint to get all tasks
    const companyId = searchParams.get('companyId') || '1';
    
    // Add pagination params if needed, defaulting to page 1, size 100 to get a good list
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '100';
    
    const targetUrl = `https://api.dyzo.ai/api/company/${companyId}/${cleanEmployeeId}/tasks/?page=${page}&page_size=${pageSize}`;
    
    const dyzoResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const errorText = await dyzoResponse.text();
    
    if (!dyzoResponse.ok) {
      throw new Error(`Dyzo API Error: ${dyzoResponse.status} ${errorText}`);
    }

    const data = JSON.parse(errorText);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Dyzo Task Fetch Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
