import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createSupabaseBrowser() {
  return createPagesBrowserClient();
}

export function createSupabaseServer() {
  return createServerComponentClient({ cookies });
}

export const supabase = createPagesBrowserClient(); 