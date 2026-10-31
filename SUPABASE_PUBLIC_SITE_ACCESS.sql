-- AutoDev public website access policy patch
-- Run this AFTER SUPABASE_RLS_SECURITY.sql in Supabase SQL Editor.
-- Dashboard CRUD remains restricted to authenticated users.

-- Make sure RLS is active (the dashboard policies are created by the preceding script).
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- A narrow public view exposes only contact/social fields needed by the website.
CREATE OR REPLACE VIEW public.public_site_settings AS
SELECT id, company_name, email, phone, whatsapp, location, website,
       social_facebook, social_instagram, social_linkedin, social_twitter
FROM public.settings
WHERE id = 1;
GRANT SELECT ON public.public_site_settings TO anon, authenticated;

-- Remove any previous public policies with these names before recreating them.
DROP POLICY IF EXISTS public_read_site_content ON public.site_content;
DROP POLICY IF EXISTS public_read_home_projects ON public.home_projects;
DROP POLICY IF EXISTS public_read_portfolio_projects ON public.portfolio_projects;
DROP POLICY IF EXISTS public_read_services ON public.services;
DROP POLICY IF EXISTS public_read_testimonials ON public.testimonials;
DROP POLICY IF EXISTS public_read_faq_items ON public.faq_items;
DROP POLICY IF EXISTS public_read_published_blog_posts ON public.blog_posts;
DROP POLICY IF EXISTS public_submit_requests ON public.requests;
DROP POLICY IF EXISTS public_submit_messages ON public.messages;

CREATE POLICY public_read_site_content ON public.site_content
  FOR SELECT TO anon USING (id = 1);
CREATE POLICY public_read_home_projects ON public.home_projects
  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY public_read_portfolio_projects ON public.portfolio_projects
  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY public_read_services ON public.services
  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY public_read_testimonials ON public.testimonials
  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY public_read_faq_items ON public.faq_items
  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY public_read_published_blog_posts ON public.blog_posts
  FOR SELECT TO anon USING (status = 'published');

-- Visitors may submit leads and contact messages, but cannot read or update them.
CREATE POLICY public_submit_requests ON public.requests
  FOR INSERT TO anon WITH CHECK (
    NULLIF(trim(name), '') IS NOT NULL AND
    NULLIF(trim(email), '') IS NOT NULL
  );
CREATE POLICY public_submit_messages ON public.messages
  FOR INSERT TO anon WITH CHECK (
    NULLIF(trim(name), '') IS NOT NULL AND
    NULLIF(trim(email), '') IS NOT NULL AND
    NULLIF(trim(message), '') IS NOT NULL
  );

