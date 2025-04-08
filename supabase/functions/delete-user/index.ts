import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async (req) => {
  const { userId, email, password } = await req.json();

  if (!userId || !email || !password) {
    return new Response(JSON.stringify({ error: 'User ID, Email, and Password are required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Try signing in with provided email and password
  const { data, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Password verification failed:', signInError);
    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  // Password correct, proceed to delete
  await supabaseAdmin.from('user_details').delete().eq('user_id', userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);

  return new Response(JSON.stringify({ message: 'User successfully deleted' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
