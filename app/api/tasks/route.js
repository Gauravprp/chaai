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
    if (taskData.projectId) {
      formData.append('projectId', taskData.projectId);
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
