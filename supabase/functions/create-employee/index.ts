import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "إعدادات الدالة ناقصة على الخادم." }, 500);

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "يجب تسجيل الدخول أولًا." }, 401);

  const userClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user?.email) return json({ error: "جلسة الدخول غير صالحة." }, 401);

  // Only an already-registered manager may create staff accounts.
  const { data: caller, error: callerError } = await admin
    .from("team").select("id,role,status,email")
    .ilike("email", userData.user.email).maybeSingle();
  if (callerError) return json({ error: "تعذر التحقق من صلاحية المدير." }, 500);
  if (!caller || caller.role !== "manager" || caller.status !== "active") {
    return json({ error: "إنشاء حسابات الموظفين متاح للمدير النشط فقط." }, 403);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "البيانات المرسلة غير صالحة." }, 400); }
  const employee = body?.employee || {};
  const email = String(employee.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const name = String(employee.name || "").trim();
  const allowedRoles = ["manager", "developer", "designer", "marketing", "support", "automation"];
  const role = allowedRoles.includes(employee.role) ? employee.role : "developer";
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: "الاسم والبريد الإلكتروني الصحيح مطلوبان." }, 400);
  if (password.length < 8) return json({ error: "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل." }, 400);
  if (email === userData.user.email.toLowerCase()) return json({ error: "استخدم بريدًا مختلفًا للموظف." }, 400);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name, employee: true },
  });
  if (createError || !created.user) return json({ error: createError?.message || "تعذر إنشاء حساب تسجيل الدخول." }, 400);

  const row = {
    name, email, phone: String(employee.phone || ""), role,
    status: employee.status === "inactive" ? "inactive" : "active",
    job_title: String(employee.job_title || ""), department: String(employee.department || ""),
    salary: Number(employee.salary) || 0, joined_at: employee.joined_at || null, notes: String(employee.notes || ""),
  };
  const { data: saved, error: saveError } = await admin.from("team").insert(row).select().single();
  if (saveError || !saved) {
    // Roll back the auth account if the staff row could not be created.
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: saveError?.message || "تعذر حفظ بيانات الموظف." }, 500);
  }
  return json({ success: true, employee: saved, user_id: created.user.id });
});
