// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — resolved after `npm install @supabase/supabase-js`
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
