import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req) {
  try {
    const { action, blockerId, blockedId, reporterId, reportedUserId, conversationId, reason } = await req.json();

    if (action === 'block') {
      const { data, error } = await supabase
        .from('blocked_users')
        .insert({ blocker_id: blockerId, blocked_id: blockedId })
        .select()
        .single();
      if (error) throw error;
      return Response.json({ success: true, data });
    }

    if (action === 'unblock') {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);
      if (error) throw error;
      return Response.json({ success: true });
    }

    if (action === 'report') {
      const { data, error } = await supabase
        .from('reports')
        .insert({ reporter_id: reporterId, reported_user_id: reportedUserId, conversation_id: conversationId, reason })
        .select()
        .single();
      if (error) throw error;
      return Response.json({ success: true, data });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
