import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req) {
  try {
    const { action, conversationId, name, description, userId, role, members } = await req.json();

    if (action === 'create') {
      // Create new group conversation
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          name,
          description,
          conversation_type: 'group',
        })
        .select()
        .single();
      if (convErr) throw convErr;

      // Add members
      if (members && members.length > 0) {
        const memberRecords = members.map(mId => ({
          conversation_id: conv.id,
          user_id: mId,
          role: mId === userId ? 'owner' : 'member',
        }));
        const { error: memErr } = await supabase
          .from('conversation_members')
          .insert(memberRecords);
        if (memErr) throw memErr;
      }

      return Response.json({ success: true, conversation: conv });
    }

    if (action === 'update_role') {
      const { error } = await supabase
        .from('conversation_members')
        .update({ role })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
      if (error) throw error;
      return Response.json({ success: true });
    }

    if (action === 'add_member') {
      const { error } = await supabase
        .from('conversation_members')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: 'member',
        });
      if (error) throw error;
      return Response.json({ success: true });
    }

    if (action === 'remove_member') {
      const { error } = await supabase
        .from('conversation_members')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
      if (error) throw error;
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
