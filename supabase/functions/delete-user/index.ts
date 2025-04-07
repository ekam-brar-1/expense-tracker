import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  const { userId } = await req.json();

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Delete from user_details table
  const { error: deleteDetailsError } = await supabaseAdmin
    .from('user_details')
    .delete()
    .eq('user_id', userId);

  if (deleteDetailsError) {
    return new Response(JSON.stringify({ error: deleteDetailsError.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  // Delete user from Supabase Auth
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    return new Response(JSON.stringify({ error: deleteAuthError.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  return new Response(JSON.stringify({ message: 'User successfully deleted' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
