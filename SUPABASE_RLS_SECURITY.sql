-- Run AFTER your original schema.sql in Supabase SQL Editor.
-- This removes the original allow-all policies and restricts dashboard data to signed-in users.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'requests','clients','categories','projects','partners','team','contracts',
    'site_content','portfolio_projects','home_projects','testimonials','blog_posts',
    'faq_items','invoices','role_permissions','automations','ads','messages',
    'services','tasks','settings'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_only_%s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "authenticated_only_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
