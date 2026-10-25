/**
 * AutoDev Agency — Data Access Layer
 * -----------------------------------
 * مستقبلاً: استبدل دوال هذا الملف باستدعاءات API / Supabase
 *          دون تغيير أي شيء في الواجهة.
 */

const STORAGE_PREFIX = "autodev_admin_";

const DEFAULT_DATA = {
  // ===== الطلبات / Leads من نموذج "ابدأ مشروعك" =====
  requests: [
    {
      id: "req_001",
      name: "أحمد بن علي",
      company: "شركة النور للتجارة",
      email: "ahmed@ennour.dz",
      phone: "0555123456",
      service: "website",
      budget: "500k-1m",
      timeline: "1-2months",
      description: "نحتاج موقع إلكتروني احترافي لعرض منتجاتنا مع نظام طلبات بسيط.",
      channel: "whatsapp",
      status: "new", // new | contacted | quoted | won | lost
      priority: "high",
      notes: "",
      created_at: "2026-09-18T10:22:00Z",
      updated_at: "2026-09-18T10:22:00Z",
    },
    {
      id: "req_002",
      name: "سارة محمد",
      company: "عيادة الأمل",
      email: "sara@alamal.clinic",
      phone: "0770987654",
      service: "mobile",
      budget: "1m-3m",
      timeline: "2-3months",
      description: "تطبيق موبايل لحجز المواعيد وإدارة المرضى.",
      channel: "email",
      status: "contacted",
      priority: "medium",
      notes: "تم التواصل واتساب - مهتمة جداً",
      created_at: "2026-09-15T14:05:00Z",
      updated_at: "2026-09-16T09:30:00Z",
    },
    {
      id: "req_003",
      name: "كريم بوزيد",
      company: "",
      email: "karim.b@gmail.com",
      phone: "0661122334",
      service: "dashboard",
      budget: "under-500k",
      timeline: "asap",
      description: "لوحة تحكم بسيطة لإدارة متجري الإلكتروني.",
      channel: "whatsapp",
      status: "quoted",
      priority: "low",
      notes: "أرسلنا عرض سعر 18/09",
      created_at: "2026-09-12T08:40:00Z",
      updated_at: "2026-09-18T11:00:00Z",
    },
  ],

  // ===== العملاء =====
  clients: [
    {
      id: "cli_001",
      name: "شركة النور للتجارة",
      contact_person: "أحمد بن علي",
      email: "ahmed@ennour.dz",
      phone: "0555123456",
      website: "https://ennour.dz",
      industry: "تجارة",
      status: "active", // active | inactive | prospect
      total_projects: 2,
      total_revenue: 1850000,
      notes: "عميل مميز - دفع منتظم",
      logo_url: "assets/logo-transparent.png",
      created_at: "2025-11-01T00:00:00Z",
      updated_at: "2026-09-10T00:00:00Z",
    },
    {
      id: "cli_002",
      name: "عيادة الأمل",
      contact_person: "سارة محمد",
      email: "sara@alamal.clinic",
      phone: "0770987654",
      website: "",
      industry: "صحة",
      status: "prospect",
      total_projects: 0,
      total_revenue: 0,
      notes: "",
      logo_url: "",
      created_at: "2026-09-15T00:00:00Z",
      updated_at: "2026-09-15T00:00:00Z",
    },
    {
      id: "cli_003",
      name: "مقهى JavaGem",
      contact_person: "يوسف حساني",
      email: "youssef@javagem.dz",
      phone: "0559876543",
      website: "",
      industry: "مطاعم",
      status: "active",
      total_projects: 1,
      total_revenue: 920000,
      notes: "تطبيق الموبايل قيد التشغيل",
      logo_url: "",
      created_at: "2025-06-20T00:00:00Z",
      updated_at: "2026-03-01T00:00:00Z",
    },
  ],

  // ===== المشاريع (نفس هيكل data.js تقريباً) =====
  projects: [
    {
      id: "p1",
      featured: true,
      badge: { ar: "المشروع الأبرز", fr: "Projet Phare", en: "Flagship Project" },
      title: { ar: "لوحة تحكم Donezo", fr: "Dashboard Donezo", en: "Donezo Dashboard" },
      short_description: {
        ar: "لوحة تحكم تحليلية لإدارة المشاريع والفرق مع إحصائيات حية وتقارير في الوقت الفعلي.",
        fr: "Tableau de bord analytique pour la gestion de projets et d'équipes.",
        en: "Analytics dashboard for project and team management.",
      },
      description: {
        ar: "نظام إدارة متكامل يجمع المشاريع، المهام، الفريق وتتبع الوقت في مكان واحد.",
        fr: "Système de gestion complet réunissant projets, tâches, équipe et suivi du temps.",
        en: "A complete management system bringing projects, tasks, team and time tracking together.",
      },
      features: {
        ar: ["إحصائيات حية", "إدارة الفريق", "تتبع الوقت", "تقارير"],
        fr: ["Statistiques live", "Gestion d'équipe", "Suivi du temps", "Rapports"],
        en: ["Live statistics", "Team management", "Time tracking", "Reports"],
      },
      year: "2026",
      cover_image_url: "assets/project-dashboard.webp",
      category_ids: ["c4", "c2"],
      technologies: ["React", "TypeScript", "Chart.js", "Supabase"],
      client_id: "cli_001",
      status: "completed", // draft | in_progress | completed | archived
      progress: 100,
      public_token: "trk_demo_donezo",
      budget: 1200000,
      likes_count: 24,
      is_visible: true,
      created_at: "2026-01-15T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: "p2",
      featured: false,
      badge: null,
      title: { ar: "منصة Nexcent للويب", fr: "Plateforme Web Nexcent", en: "Nexcent Web Platform" },
      short_description: {
        ar: "موقع شركة متكامل بصفحة هبوط عصرية وإدارة محتوى.",
        fr: "Site d'entreprise complet avec landing moderne.",
        en: "Complete corporate site with modern landing page.",
      },
      description: {
        ar: "منصة ويب للشركات: صفحة هبوط، مدونة، عرض العملاء والخدمات.",
        fr: "Plateforme web pour entreprises : landing, blog, clients et services.",
        en: "Web platform for companies: landing, blog, clients and services.",
      },
      features: {
        ar: ["تصميم متجاوب", "مدونة", "SEO", "أداء عالي"],
        fr: ["Design responsive", "Blog", "SEO", "Performance"],
        en: ["Responsive design", "Blog", "SEO", "High performance"],
      },
      year: "2026",
      cover_image_url: "assets/project-webapp.webp",
      category_ids: ["c2", "c3"],
      technologies: ["Next.js", "Tailwind", "PostgreSQL"],
      client_id: null,
      status: "completed",
      budget: 650000,
      likes_count: 11,
      is_visible: true,
      created_at: "2025-11-01T00:00:00Z",
      updated_at: "2026-04-20T00:00:00Z",
    },
    {
      id: "p3",
      featured: false,
      badge: null,
      title: { ar: "تطبيق مقهى JavaGem", fr: "App JavaGem Coffee", en: "JavaGem Coffee App" },
      short_description: {
        ar: "تطبيق موبايل أنيق لطلب القهوة مع تتبع الطلبات.",
        fr: "App mobile élégante de commande de café.",
        en: "Elegant coffee ordering mobile app.",
      },
      description: {
        ar: "تطبيق كامل للمقاهي: قائمة، تخصيص، دفع، تتبع، ولاء.",
        fr: "App complète pour cafés : catalogue, personnalisation, paiement, suivi.",
        en: "Complete café app: catalog, customization, payment, tracking.",
      },
      features: {
        ar: ["طلب وتخصيص", "دفع إلكتروني", "تتبع لحظي", "ولاء"],
        fr: ["Commande", "Paiement", "Suivi", "Fidélité"],
        en: ["Ordering", "Payment", "Tracking", "Loyalty"],
      },
      year: "2025",
      cover_image_url: "assets/project-coffee.png",
      category_ids: ["c1"],
      technologies: ["Flutter", "Firebase", "Stripe"],
      client_id: "cli_003",
      status: "completed",
      budget: 920000,
      likes_count: 38,
      is_visible: true,
      created_at: "2025-06-01T00:00:00Z",
      updated_at: "2025-12-15T00:00:00Z",
    },
  ],

  categories: [
    { id: "c1", slug: "mobile", name: { ar: "تطبيقات موبايل", fr: "Apps Mobiles", en: "Mobile Apps" }, is_visible: true },
    { id: "c2", slug: "web", name: { ar: "مواقع ويب", fr: "Sites Web", en: "Websites" }, is_visible: true },
    { id: "c3", slug: "ui", name: { ar: "واجهات UI/UX", fr: "UI/UX", en: "UI/UX" }, is_visible: true },
    { id: "c4", slug: "dashboard", name: { ar: "لوحات تحكم", fr: "Dashboards", en: "Dashboards" }, is_visible: true },
  ],

  // ===== الشركاء =====
  partners: [
    {
      id: "par_001",
      name: "Cloudify Algeria",
      type: "technology", // technology | marketing | agency | other
      contact_person: "رضا بلقاسم",
      email: "reda@cloudify.dz",
      phone: "0550111222",
      website: "https://cloudify.dz",
      logo_url: "",
      status: "active",
      partnership_start: "2025-03-01",
      notes: "شريك تقني - استضافة و CDN",
      created_at: "2025-03-01T00:00:00Z",
    },
    {
      id: "par_002",
      name: "Agence Horizon",
      type: "marketing",
      contact_person: "نادية كريم",
      email: "nadia@horizon.agency",
      phone: "0662333444",
      website: "https://horizon.agency",
      logo_url: "",
      status: "active",
      partnership_start: "2025-09-15",
      notes: "شراكة تسويقية - إحالة عملاء",
      created_at: "2025-09-15T00:00:00Z",
    },
  ],

  // ===== العقود (شركاء + موظفين) =====
  contracts: [
    {
      id: "ctr_001",
      party_type: "partner", // partner | employee
      partner_id: "par_001",
      employee_id: null,
      title: "اتفاقية استضافة و CDN 2025-2026",
      type: "service", // service | referral | revenue_share | exclusive | employment | freelance | nda
      start_date: "2025-03-01",
      end_date: "2026-02-28",
      value: 0,
      currency: "DZD",
      status: "active",
      terms: "خصم 30% على خدمات الاستضافة + دعم فني مشترك.",
      body: "تم الاتفاق بين AutoDev Agency والطرف الثاني Cloudify Algeria على تقديم خدمات الاستضافة وCDN وفق الشروط المتفق عليها، مع خصم تجاري بنسبة 30% ودعم فني مشترك طوال مدة العقد.",
      document_url: "",
      auto_renew: true,
      created_at: "2025-02-20T00:00:00Z",
      updated_at: "2025-03-01T00:00:00Z",
    },
    {
      id: "ctr_002",
      party_type: "partner",
      partner_id: "par_002",
      employee_id: null,
      title: "شراكة إحالة عملاء - Horizon",
      type: "referral",
      start_date: "2025-09-15",
      end_date: "2026-09-14",
      value: 15,
      currency: "%",
      status: "active",
      terms: "عمولة 15% على كل عميل محال يتم توقيع عقد معه.",
      body: "اتفاقية إحالة عملاء بين AutoDev Agency وAgence Horizon. يستحق الطرف الثاني عمولة 15% عن كل عميل محال يتم توقيع عقد خدمات معه خلال مدة الاتفاقية.",
      document_url: "",
      auto_renew: false,
      created_at: "2025-09-10T00:00:00Z",
      updated_at: "2025-09-15T00:00:00Z",
    },
    {
      id: "ctr_003",
      party_type: "employee",
      partner_id: null,
      employee_id: "tm_001",
      title: "عقد عمل — يوسف بن عمر (مدير)",
      type: "employment",
      start_date: "2024-01-15",
      end_date: "2027-01-14",
      value: 180000,
      currency: "DZD",
      status: "active",
      terms: "عقد عمل محدد المدة — دوام كامل — سرية مهنية.",
      body: "عقد عمل\n\nالطرف الأول: AutoDev Agency\nالطرف الثاني: يوسف بن عمر\n\nالمادة 1: طبيعة العمل\nيُعيَّن الطرف الثاني في منصب مدير مشاريع بدوام كامل.\n\nالمادة 2: المدة\nيسري هذا العقد من 15/01/2024 إلى 14/01/2027.\n\nالمادة 3: الأجر\nيتقاضى الطرف الثاني راتباً شهرياً قدره 180.000 د.ج.\n\nالمادة 4: الالتزامات\nيلتزم الطرف الثاني بالحفاظ على سرية معلومات الشركة وعدم منافستها أثناء مدة العقد.\n\nالمادة 5: إنهاء العقد\nيمكن لأي طرف إنهاء العقد بإشعار مكتوب قبل 30 يوماً.",
      document_url: "",
      auto_renew: true,
      created_at: "2024-01-10T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "ctr_004",
      party_type: "employee",
      partner_id: null,
      employee_id: "tm_002",
      title: "عقد عمل — أمينة خالدي (مصممة)",
      type: "employment",
      start_date: "2024-06-01",
      end_date: "2026-05-31",
      value: 120000,
      currency: "DZD",
      status: "active",
      terms: "عقد عمل — قسم التصميم.",
      body: "عقد عمل\n\nالطرف الأول: AutoDev Agency\nالطرف الثاني: أمينة خالدي\n\nالمادة 1: يُعيَّن الطرف الثاني مصممة UI/UX.\nالمادة 2: المدة من 01/06/2024 إلى 31/05/2026.\nالمادة 3: الراتب الشهري 120.000 د.ج.\nالمادة 4: الالتزام بالسرية والملكية الفكرية لصالح الشركة.",
      document_url: "",
      auto_renew: false,
      created_at: "2024-05-20T00:00:00Z",
      updated_at: "2024-06-01T00:00:00Z",
    },
  ],


  // ===== محتوى الموقع (CMS) =====
  site_content: {
    hero: {
      title_ar: "نحوّل أفكارك إلى <span class=\"highlight\">حلول برمجية</span> حقيقية",
      title_fr: "Nous transformons vos idées en <span class=\"highlight\">solutions logicielles</span> réelles",
      title_en: "We turn your ideas into real <span class=\"highlight\">software solutions</span>",
      subtitle_ar: "حلول تقنية متكاملة • تصميم واجهات عصرية • تطوير ويب وموبايل",
      subtitle_fr: "Solutions technologiques complètes • Design d'interfaces modernes • Développement web & mobile",
      subtitle_en: "Complete tech solutions • Modern UI/UX design • Web & mobile app development",
    },
    about: {
      badge_ar: "من نحن", badge_fr: "À propos", badge_en: "About Us",
      title_ar: "من نحن", title_fr: "Qui sommes-nous", title_en: "Who We Are",
      desc_ar: "نحن فريق من المطورين والمصممين الشغوفين بالتكنولوجيا، نعمل على تحويل أفكارك إلى منتجات رقمية ناجحة. نؤمن بالجودة والابتكار والشراكة طويلة الأمد مع عملائنا.",
      desc_fr: "Nous sommes une équipe de développeurs et designers passionnés par la technologie, transformant vos idées en produits numériques réussis.",
      desc_en: "We are a team of developers and designers passionate about technology, turning your ideas into successful digital products.",
      box1_t_ar: "الجودة أولاً", box1_d_ar: "معايير عالية في كل سطر كود",
      box1_t_fr: "Qualité d'abord", box1_d_fr: "Standards élevés dans chaque ligne de code",
      box1_t_en: "Quality First", box1_d_en: "High standards in every line of code",
      box2_t_ar: "سرعة التنفيذ", box2_d_ar: "تسليم في الوقت المحدد دائماً",
      box2_t_fr: "Rapidité", box2_d_fr: "Livraison toujours dans les délais",
      box2_t_en: "Fast Delivery", box2_d_en: "Always on time, every time",
      box3_t_ar: "فريق محترف", box3_d_ar: "خبراء في أحدث التقنيات",
      box3_t_fr: "Équipe pro", box3_d_fr: "Experts des dernières technologies",
      box3_t_en: "Pro Team", box3_d_en: "Experts in the latest technologies",
      box4_t_ar: "دعم مستمر", box4_d_ar: "مرافقة بعد التسليم",
      box4_t_fr: "Support continu", box4_d_fr: "Accompagnement après livraison",
      box4_t_en: "Ongoing Support", box4_d_en: "Partnership after delivery",
    },
    legal: {
      terms_ar: "الشروط والأحكام\n\nباستخدامك لموقع AutoDev Agency أو التعاقد معنا، فإنك توافق على هذه الشروط.\n\n1. الخدمات: نقدم خدمات تطوير البرمجيات وفق ما يُتفق عليه تعاقدياً.\n2. الدفع: دفعة مقدمة عند التوقيع، دفعات مرحلية، والرصيد عند التسليم.\n3. الملكية الفكرية: تنتقل للعميل بعد سداد كامل المستحقات.\n4. السرية: يلتزم الطرفان بالحفاظ على سرية المعلومات.\n5. القانون الواجب التطبيق: قوانين الجمهورية الجزائرية الديمقراطية الشعبية.",
      terms_fr: "Conditions générales\n\nEn utilisant le site AutoDev Agency ou en contractant avec nous, vous acceptez ces conditions.\n\n1. Services : développement logiciel selon le contrat.\n2. Paiement : acompte, jalons, solde à la livraison.\n3. Propriété intellectuelle : transférée après paiement intégral.\n4. Confidentialité : obligation mutuelle.\n5. Droit applicable : droit algérien.",
      terms_en: "Terms & Conditions\n\nBy using the AutoDev Agency website or engaging our services, you agree to these terms.\n\n1. Services: software development as agreed contractually.\n2. Payment: deposit, milestones, balance on delivery.\n3. IP: transferred after full payment.\n4. Confidentiality: mutual obligation.\n5. Governing law: Algerian law.",
      privacy_ar: "سياسة الخصوصية\n\nنحترم خصوصيتك.\n\n- نجمع البيانات التي ترسلها عبر نماذج التواصل (الاسم، البريد، الهاتف، وصف المشروع).\n- نستخدمها للرد على طلباتك وتقديم الخدمة فقط.\n- لا نبيع بياناتك لأطراف ثالثة.\n- التفضيلات (اللغة، السمة) تُحفظ محلياً في متصفحك.\n- يمكنك طلب حذف بياناتك عبر التواصل معنا.",
      privacy_fr: "Politique de confidentialité\n\nNous respectons votre vie privée.\n\n- Données collectées via les formulaires (nom, e-mail, téléphone, description).\n- Utilisées uniquement pour répondre et livrer le service.\n- Pas de vente à des tiers.\n- Préférences stockées localement dans le navigateur.\n- Droit de suppression sur simple demande.",
      privacy_en: "Privacy Policy\n\nWe respect your privacy.\n\n- We collect data you submit via forms (name, email, phone, project description).\n- Used only to respond and deliver the service.\n- We do not sell your data.\n- Preferences are stored locally in your browser.\n- You may request deletion by contacting us.",
      cookies_ar: "سياسة ملفات تعريف الارتباط (الكوكيز)\n\nنستخدم التخزين المحلي للمتصفح لحفظ تفضيلات اللغة والسمة وموافقة الكوكيز. لا نستخدم كوكيز تتبع إعلاني من أطراف ثالثة بدون موافقتك.",
      cookies_fr: "Politique des cookies\n\nNous utilisons le stockage local du navigateur pour la langue, le thème et le bandeau cookies. Pas de cookies publicitaires tiers sans consentement.",
      cookies_en: "Cookie Policy\n\nWe use browser local storage for language, theme and cookie consent. No third-party ad tracking cookies without consent.",
    },
  },

  // ===== مشاريع البورتفوليو (3 لغات) =====
  portfolio_projects: [
    {
      id: "p1",
      title: { ar: "لوحة تحكم Donezo", fr: "Dashboard Donezo", en: "Donezo Dashboard" },
      short_description: {
        ar: "لوحة تحكم تحليلية لإدارة المشاريع والفرق.",
        fr: "Tableau de bord analytique pour projets et équipes.",
        en: "Analytics dashboard for projects and teams.",
      },
      description: {
        ar: "نظام إدارة متكامل مع رسوم بيانية حية وتقارير.",
        fr: "Système de gestion avec graphiques en direct et rapports.",
        en: "Complete management system with live charts and reports.",
      },
      year: "2026",
      cover_image_url: "assets/project-dashboard.webp",
      gallery: ["assets/project-dashboard.webp"],
      category: "dashboard",
      tech: ["React", "TypeScript", "Chart.js", "Supabase"],
      is_visible: true,
      sort_order: 1,
    },
    {
      id: "p2",
      title: { ar: "منصة Nexcent للويب", fr: "Plateforme Web Nexcent", en: "Nexcent Web Platform" },
      short_description: {
        ar: "موقع شركة متكامل بصفحة هبوط عصرية.",
        fr: "Site d'entreprise avec landing moderne.",
        en: "Corporate site with modern landing page.",
      },
      description: {
        ar: "منصة ويب للشركات: هبوط، مدونة، خدمات، تواصل.",
        fr: "Plateforme web : landing, blog, services, contact.",
        en: "Web platform: landing, blog, services, contact.",
      },
      year: "2026",
      cover_image_url: "assets/project-webapp.webp",
      gallery: ["assets/project-webapp.webp"],
      category: "web",
      tech: ["Next.js", "Tailwind", "PostgreSQL"],
      is_visible: true,
      sort_order: 2,
    },
  ],


  // ===== مشاريع الصفحة الرئيسية =====
  home_projects: [
    {
      id: "hp1",
      title: { ar: "تطبيق مقهى JavaGem", fr: "App JavaGem Coffee", en: "JavaGem Coffee App" },
      description: {
        ar: "تطبيق موبايل أنيق لطلب القهوة مع واجهة عصرية وطلب سهل وتتبع الطلبات",
        fr: "Application mobile élégante pour commander du café",
        en: "Elegant mobile app for ordering coffee with modern UI",
      },
      category: "mobile",
      tag: "Mobile App",
      image: "assets/project-coffee.png",
      tech: ["Flutter", "Firebase", "Stripe", "Figma"],
      is_visible: true,
      sort_order: 1,
    },
    {
      id: "hp2",
      title: { ar: "مجموعة واجهات توصيل الطعام", fr: "UI Kit livraison", en: "Food Delivery UI Kit" },
      description: {
        ar: "أكثر من 50 شاشة عالية الجودة لتطبيقات توصيل الطعام والمطاعم",
        fr: "Plus de 50 écrans haute qualité",
        en: "50+ high quality screens for food delivery apps",
      },
      category: "ui mobile",
      tag: "UI Kit",
      image: "assets/project-food.png",
      tech: ["Figma", "UI/UX", "Mobile"],
      is_visible: true,
      sort_order: 2,
    },
    {
      id: "hp3",
      title: { ar: "تطبيق الطقس الذكي", fr: "App Météo", en: "Smart Weather App" },
      description: {
        ar: "تطبيق طقس حديث بتصميم داكن أنيق مع توقعات ساعة بساعة ورسوم متحركة",
        fr: "Application météo moderne au design sombre",
        en: "Modern weather app with dark design and hourly forecasts",
      },
      category: "mobile",
      tag: "Mobile App",
      image: "assets/project-weather.png",
      tech: ["React Native", "API", "Animation"],
      is_visible: true,
      sort_order: 3,
    },
    {
      id: "hp4",
      title: { ar: "منصة تجارة إلكترونية", fr: "E-commerce", en: "E-commerce Platform" },
      description: {
        ar: "متجر إلكتروني كامل مع سلة شراء، دفع إلكتروني، وإدارة طلبات",
        fr: "Boutique en ligne complète",
        en: "Full e-commerce store with cart and payments",
      },
      category: "web",
      tag: "Web App",
      image: "assets/project-webapp.webp",
      tech: ["Next.js", "Stripe", "PostgreSQL", "Tailwind"],
      is_visible: true,
      sort_order: 4,
    },
    {
      id: "hp5",
      title: { ar: "لوحة تحكم تحليلية", fr: "Dashboard analytique", en: "Analytics Dashboard" },
      description: {
        ar: "نظام إدارة متكامل مع رسوم بيانية حية وتقارير",
        fr: "Gestion avec graphiques en direct",
        en: "Management system with live charts and reports",
      },
      category: "dashboard web",
      tag: "Dashboard",
      image: "assets/project-dashboard.webp",
      tech: ["React", "TypeScript", "Chart.js", "Supabase"],
      is_visible: true,
      sort_order: 5,
    },
  ],

  testimonials: [
    {
      id: "ts1",
      name: { ar: "كريم ب.", fr: "Karim B.", en: "Karim B." },
      role: { ar: "مدير شركة", fr: "Directeur", en: "Company Director" },
      content: {
        ar: "تعامل احترافي وتسليم في الوقت. أنصح بالتعامل مع AutoDev.",
        fr: "Travail professionnel et livraison dans les délais.",
        en: "Professional work and on-time delivery. Highly recommend AutoDev.",
      },
      avatar: "",
      rating: 5,
      is_visible: true,
      sort_order: 1,
    },
    {
      id: "ts2",
      name: { ar: "سارة م.", fr: "Sara M.", en: "Sara M." },
      role: { ar: "صاحبة متجر إلكتروني", fr: "Gérante e-commerce", en: "E-commerce owner" },
      content: {
        ar: "صمموا لي متجراً سريعاً وسهل الإدارة. الدعم بعد التسليم ممتاز.",
        fr: "Boutique rapide et simple à gérer. Excellent support après livraison.",
        en: "They built a fast store that's easy to manage. Great post-delivery support.",
      },
      avatar: "",
      rating: 5,
      is_visible: true,
      sort_order: 2,
    },
    {
      id: "ts3",
      name: { ar: "يوسف ع.", fr: "Youcef A.", en: "Youcef A." },
      role: { ar: "مؤسس شركة ناشئة", fr: "Fondateur startup", en: "Startup founder" },
      content: {
        ar: "من الفكرة إلى التطبيق خلال أسابيع. فريق منظم وواضح في التواصل.",
        fr: "De l'idée à l'app en quelques semaines. Équipe organisée et claire.",
        en: "From idea to app in weeks. Organized team and clear communication.",
      },
      avatar: "",
      rating: 5,
      is_visible: true,
      sort_order: 3,
    },
  ],

  blog_posts: [
    {
      id: "bp1",
      title: { ar: "لماذا تحتاج شركتك إلى لوحة تحكم مخصصة؟", fr: "Pourquoi un dashboard sur mesure ?", en: "Why your company needs a custom dashboard" },
      excerpt: {
        ar: "لوحة التحكم تحول بياناتك إلى قرارات يومية واضحة.",
        fr: "Un dashboard transforme vos données en décisions.",
        en: "A dashboard turns your data into clear daily decisions.",
      },
      body: {
        ar: "في هذا المقال نستعرض أهم فوائد لوحات التحكم المخصصة للشركات الجزائرية.",
        fr: "Dans cet article, nous explorons les bénéfices d'un dashboard sur mesure.",
        en: "In this article we explore the benefits of custom dashboards for growing teams.",
      },
      cover: "",
      status: "published",
      published_at: "2026-01-15",
      sort_order: 1,
    },
  ],

  faq_items: [
    {
      id: "faq1",
      question: { ar: "كم تستغرق مدة تطوير مشروع؟", fr: "Combien de temps pour un projet ?", en: "How long does a project take?" },
      answer: {
        ar: "حسب النطاق: من أسبوعين للمواقع البسيطة إلى عدة أشهر للأنظمة الكبيرة.",
        fr: "Selon le scope : de 2 semaines à plusieurs mois.",
        en: "Depending on scope: from two weeks for simple sites to several months for large systems.",
      },
      is_visible: true,
      sort_order: 1,
    },
    {
      id: "faq2",
      question: { ar: "هل تقدمون الدعم بعد التسليم؟", fr: "Support après livraison ?", en: "Do you offer post-delivery support?" },
      answer: {
        ar: "نعم، نوفر باقات دعم وصيانة شهرية حسب الاتفاق.",
        fr: "Oui, des forfaits de support mensuels selon contrat.",
        en: "Yes, monthly support and maintenance packages as agreed.",
      },
      is_visible: true,
      sort_order: 2,
    },
  ],

  invoices: [],

  role_permissions: {
    manager: ["overview","requests","clients","projects","tasks","messages","partners","contracts","automations","ads","services","sitecontent","portfolioprojects","homeprojects","testimonials","blog","faq","team","invoices","settings","notifications"],
    developer: ["overview","projects","tasks","messages","notifications"],
    designer: ["overview","projects","tasks","portfolioprojects","homeprojects","notifications"],
    marketing: ["overview","ads","messages","blog","testimonials","notifications"],
    support: ["overview","requests","messages","faq","notifications"],
    automation: ["overview","automations","tasks","notifications"],
  },

  // ===== الأتمتة =====
  automations: [
    {
      id: "auto_001",
      name: "تذكير انتهاء العقود",
      trigger: "contract_expiring", // contract_expiring | employee_added | request_new | task_overdue
      enabled: true,
      days_before: 30,
      action: "create_task", // create_task | notify
      action_config: { task_title: "تجديد عقد: {{title}}", assignee_role: "manager" },
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "auto_002",
      name: "إنشاء مهمة عند إضافة موظف",
      trigger: "employee_added",
      enabled: true,
      days_before: 0,
      action: "create_task",
      action_config: { task_title: "إعداد عقد عمل لـ {{name}}", assignee_role: "manager" },
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "auto_003",
      name: "مهمة للمتابعة عند طلب جديد",
      trigger: "request_new",
      enabled: true,
      days_before: 0,
      action: "create_task",
      action_config: { task_title: "متابعة طلب: {{name}}", assignee_role: "manager" },
      created_at: "2026-01-01T00:00:00Z",
    },
  ],

  // ===== الإعلانات =====
  ads: [
    {
      id: "ad_001",
      title: "حملة فيسبوك - خدمات الويب",
      platform: "facebook", // facebook | instagram | google | linkedin | tiktok | other
      status: "active", // draft | scheduled | active | paused | completed
      budget: 85000,
      spent: 42300,
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      target: "أصحاب الشركات الصغيرة في الجزائر",
      impressions: 125400,
      clicks: 3120,
      conversions: 18,
      notes: "أداء جيد على شريحة 25-40 سنة",
      created_at: "2026-08-28T00:00:00Z",
      updated_at: "2026-09-18T00:00:00Z",
    },
    {
      id: "ad_002",
      title: "إعلانات جوجل - كلمات مفتاحية",
      platform: "google",
      status: "active",
      budget: 120000,
      spent: 67800,
      start_date: "2026-08-15",
      end_date: "2026-10-15",
      target: "بحث عن 'تطوير مواقع' و 'تطبيقات موبايل الجزائر'",
      impressions: 45200,
      clicks: 1890,
      conversions: 27,
      notes: "",
      created_at: "2026-08-10T00:00:00Z",
      updated_at: "2026-09-17T00:00:00Z",
    },
    {
      id: "ad_003",
      title: "حملة إنستغرام - ريلز",
      platform: "instagram",
      status: "paused",
      budget: 45000,
      spent: 45000,
      start_date: "2026-07-01",
      end_date: "2026-07-31",
      target: "شباب 18-30 مهتمين بالتقنية",
      impressions: 89000,
      clicks: 4200,
      conversions: 9,
      notes: "انتهى الميزانية",
      created_at: "2026-06-25T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    },
  ],

  // ===== رسائل التواصل =====
  messages: [
    {
      id: "msg_001",
      name: "ليلى عبد الرحمن",
      email: "leila.ab@gmail.com",
      phone: "0555444333",
      subject: "استفسار عن أسعار التطبيقات",
      message: "السلام عليكم، أريد معرفة تكلفة تطبيق موبايل بسيط لإدارة مخزون محل.",
      status: "unread", // unread | read | replied | archived
      source: "contact_form",
      created_at: "2026-09-19T16:45:00Z",
    },
    {
      id: "msg_002",
      name: "محمد الطاهر",
      email: "m.tahar@company.dz",
      phone: "",
      subject: "طلب عرض سعر",
      message: "نحتاج إعادة تصميم موقعنا الحالي + لوحة تحكم. هل يمكنكم إرسال عرض؟",
      status: "replied",
      source: "contact_form",
      created_at: "2026-09-14T11:20:00Z",
    },
  ],

  // ===== الخدمات =====
  services: [
    {
      id: "svc_001",
      slug: "web",
      title: { ar: "تطوير المواقع", fr: "Développement Web", en: "Web Development" },
      short_description: {
        ar: "مواقع سريعة، آمنة، ومتجاوبة بالكامل.",
        fr: "Sites rapides, sécurisés et entièrement responsive.",
        en: "Fast, secure and fully responsive websites.",
      },
      icon: "globe",
      is_visible: true,
      sort_order: 1,
    },
    {
      id: "svc_002",
      slug: "mobile",
      title: { ar: "تطبيقات الموبايل", fr: "Apps Mobiles", en: "Mobile Apps" },
      short_description: {
        ar: "تطبيقات iOS و Android بأداء عالي.",
        fr: "Applications iOS et Android haute performance.",
        en: "High-performance iOS and Android apps.",
      },
      icon: "smartphone",
      is_visible: true,
      sort_order: 2,
    },
    {
      id: "svc_003",
      slug: "dashboard",
      title: { ar: "لوحات التحكم", fr: "Tableaux de bord", en: "Dashboards" },
      short_description: {
        ar: "لوحات تحليلية وإدارية مخصصة.",
        fr: "Tableaux de bord analytiques et administratifs.",
        en: "Custom analytics and admin dashboards.",
      },
      icon: "layout-dashboard",
      is_visible: true,
      sort_order: 3,
    },
    {
      id: "svc_004",
      slug: "uiux",
      title: { ar: "تصميم UI/UX", fr: "Design UI/UX", en: "UI/UX Design" },
      short_description: {
        ar: "واجهات أنيقة وتجربة مستخدم ممتازة.",
        fr: "Interfaces élégantes et excellente UX.",
        en: "Elegant interfaces and excellent UX.",
      },
      icon: "palette",
      is_visible: true,
      sort_order: 4,
    },
    {
      id: "svc_005",
      slug: "automation",
      title: { ar: "الأتمتة", fr: "Automatisation", en: "Automation" },
      short_description: {
        ar: "أتمتة العمليات وسير العمل والتكاملات الذكية.",
        fr: "Automatisation des processus, workflows et intégrations intelligentes.",
        en: "Process automation, workflows and smart integrations.",
      },
      icon: "bot",
      is_visible: true,
      sort_order: 5,
    },
  ],

  // ===== المهام =====
  tasks: [
    {
      id: "tsk_001",
      title: "إعداد عرض سعر لعيادة الأمل",
      description: "تحضير عرض تفصيلي لتطبيق حجز المواعيد",
      status: "todo",
      priority: "high",
      assignee_id: "tm_001",
      related_type: "request",
      related_id: "req_002",
      due_date: "2026-09-25",
      created_at: "2026-09-16T10:00:00Z",
      updated_at: "2026-09-16T10:00:00Z",
    },
    {
      id: "tsk_002",
      title: "مراجعة تصميم لوحة Donezo",
      description: "مراجعة نهائية قبل التسليم للعميل",
      status: "doing",
      priority: "medium",
      assignee_id: "tm_002",
      related_type: "project",
      related_id: "p1",
      due_date: "2026-09-22",
      created_at: "2026-09-10T09:00:00Z",
      updated_at: "2026-09-18T14:00:00Z",
    },
    {
      id: "tsk_003",
      title: "متابعة شريك Cloudify — تجديد العقد",
      description: "التواصل بشأن تجديد اتفاقية الاستضافة",
      status: "todo",
      priority: "medium",
      assignee_id: "tm_001",
      related_type: "partner",
      related_id: "par_001",
      due_date: "2026-10-01",
      created_at: "2026-09-15T11:00:00Z",
      updated_at: "2026-09-15T11:00:00Z",
    },
    {
      id: "tsk_004",
      title: "نشر تقرير أداء إعلانات سبتمبر",
      description: "",
      status: "done",
      priority: "low",
      assignee_id: "tm_003",
      related_type: "none",
      related_id: null,
      due_date: "2026-09-18",
      created_at: "2026-09-05T08:00:00Z",
      updated_at: "2026-09-18T16:00:00Z",
    },
  ],

  // ===== الفريق =====
  team: [
    {
      id: "tm_001",
      name: "يوسف بن عمر",
      email: "youssef@autodev.agency",
      phone: "0555111222",
      role: "manager",
      status: "active",
      avatar_url: "",
      joined_at: "2024-01-15",
      created_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "tm_002",
      name: "أمينة خالدي",
      email: "amina@autodev.agency",
      phone: "0666333444",
      role: "designer",
      status: "active",
      avatar_url: "",
      joined_at: "2024-06-01",
      created_at: "2024-06-01T00:00:00Z",
    },
    {
      id: "tm_003",
      name: "كريم بوعلام",
      email: "karim@autodev.agency",
      phone: "0777555666",
      role: "developer",
      status: "active",
      avatar_url: "",
      joined_at: "2025-02-10",
      created_at: "2025-02-10T00:00:00Z",
    },
    {
      id: "tm_004",
      name: "سليم برقان",
      email: "selim@autodev.agency",
      phone: "0555000111",
      role: "automation",
      status: "active",
      avatar_url: "",
      job_title: "أخصائي أتمتة",
      department: "Automation",
      salary: 140000,
      joined_at: "2025-08-01",
      created_at: "2025-08-01T00:00:00Z",
    },
  ],

  // ===== الإعدادات العامة =====
  settings: {
    company_name: "AutoDev Agency",
    email: "contact@autodev.agency",
    phone: "+213 664 415 139",
    whatsapp: "213664415139",
    location: "Tizi Ouzou, Algérie",
    website: "https://autodev.agency",
    default_lang: "ar",
    currency: "DZD",
    currency_symbol: "د.ج",
    working_hours: "الأحد — الخميس · 09:00 – 18:00",
    timezone: "Africa/Algiers",
    invoice_prefix: "ADV-",
    tax_id: "",
    social_facebook: "",
    social_instagram: "https://instagram.com/autodev",
    social_linkedin: "",
    social_twitter: "",
    notify_email_requests: true,
    notify_email_messages: true,
    notify_whatsapp: true,
    notify_contracts: true,
    notify_low_budget: true,
    logo_url: "",
    favicon_url: "",
    primary_color: "#00d4ff",
    secondary_color: "#f97316",
    seo_title: "AutoDev Agency — تطوير مواقع وتطبيقات",
    seo_description: "وكالة رقمية متخصصة في تطوير المواقع والتطبيقات ولوحات التحكم في الجزائر",
    seo_keywords: "تطوير مواقع, تطبيقات موبايل, لوحات تحكم, الجزائر",
    seo_canonical: "https://autodev.agency/",
    seo_og_image: "assets/preview.png",
    seo_robots: "index, follow",
    seo_notes: "robots.txt و sitemap.xml في جذر الموقع",
    google_analytics: "",
    facebook_pixel: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    email_from: "noreply@autodev.agency",
    session_timeout: 60,
    items_per_page: 20,
    date_format: "DD/MM/YYYY",
    two_factor: false,
    maintenance_mode: false,
    auto_backup: true,
  },
};


/**
 * AutoDev Dashboard — Supabase data layer.
 * Uses the publishable key only. Never put a Supabase secret/service_role key in browser code.
 */
const TABLES = new Set([
  "requests","clients","categories","projects","partners","team","contracts","site_content",
  "portfolio_projects","home_projects","testimonials","blog_posts","faq_items","invoices",
  "role_permissions","automations","ads","messages","services","tasks","settings"
]);
const SINGLETONS = {
  settings: { table: "settings", id: 1 },
  site_content: { table: "site_content", id: 1 },
  role_permissions: { table: "role_permissions", id: 1 }
};
function db() {
  if (!window.supabaseClient) throw new Error("Supabase لم يتم تهيئته. تحقق من إعدادات index.html.");
  return window.supabaseClient;
}
function assertTable(name) {
  if (!TABLES.has(name)) throw new Error("مجموعة بيانات غير معروفة: " + name);
}
function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}
async function fetchSingleton(key) {
  const cfg = SINGLETONS[key];
  const row = unwrap(await db().from(cfg.table).select("*").eq("id", cfg.id).maybeSingle());
  if (!row) return key === "settings" ? {} : key === "site_content" ? {hero:{},about:{},legal:{}} : {};
  if (key === "site_content") return {hero: row.hero || {}, about: row.about || {}, legal: row.legal || {}};
  if (key === "role_permissions") return row.permissions || {};
  return row;
}
async function saveSingleton(key, payload) {
  const cfg = SINGLETONS[key];
  if (key === "site_content") {
    const current = await fetchSingleton(key);
    const next = {
      hero: {...(current.hero || {}), ...(payload.hero || {})},
      about: {...(current.about || {}), ...(payload.about || {})},
      legal: {...(current.legal || {}), ...(payload.legal || {})}
    };
    unwrap(await db().from(cfg.table).upsert({id: 1, ...next}, {onConflict:"id"}).select().single());
    return next;
  }
  if (key === "role_permissions") {
    const current = await fetchSingleton(key);
    const next = {...current, ...payload};
    unwrap(await db().from(cfg.table).upsert({id:1, permissions:next}, {onConflict:"id"}).select().single());
    return next;
  }
  const current = await fetchSingleton(key);
  const next = {...current, ...payload, id:1};
  unwrap(await db().from(cfg.table).upsert(next, {onConflict:"id"}).select().single());
  return next;
}
const API = {
  async list(collection) {
    assertTable(collection);
    if (SINGLETONS[collection]) {
      const value = await fetchSingleton(collection);
      return collection === "settings" ? [value] : collection === "site_content" ? [value] : [value];
    }
    return unwrap(await db().from(collection).select("*").order("created_at", {ascending:false, nullsFirst:false}));
  },
  async get(collection, id) {
    assertTable(collection);
    if (SINGLETONS[collection]) return fetchSingleton(collection);
    return unwrap(await db().from(collection).select("*").eq("id", id).maybeSingle());
  },
  async create(collection, payload) {
    assertTable(collection);
    if (SINGLETONS[collection]) return saveSingleton(collection, payload);
    return unwrap(await db().from(collection).insert(payload).select().single());
  },
  async update(collection, id, payload) {
    assertTable(collection);
    if (SINGLETONS[collection]) return saveSingleton(collection, payload);
    return unwrap(await db().from(collection).update({...payload, updated_at:new Date().toISOString()}).eq("id", id).select().single());
  },
  async remove(collection, id) {
    assertTable(collection);
    if (SINGLETONS[collection]) throw new Error("لا يمكن حذف سجل الإعدادات الرئيسي.");
    unwrap(await db().from(collection).delete().eq("id", id));
    return true;
  },
  async getSettings() { return fetchSingleton("settings"); },
  async updateSettings(payload) { return saveSingleton("settings", payload); },
  async getSiteContent() { return fetchSingleton("site_content"); },
  async updateSiteContent(payload) { return saveSingleton("site_content", payload); },
  async getDashboardStats() {
    const names = ["requests","clients","projects","ads","messages","contracts","tasks"];
    const rows = await Promise.all(names.map(n => API.list(n)));
    const [requests,clients,projects,ads,messages,contracts,tasks] = rows;
    const newRequests = requests.filter(r=>r.status==="new").length;
    const activeClients = clients.filter(c=>c.status==="active").length;
    const totalRevenue = clients.reduce((s,c)=>s+Number(c.total_revenue||0),0);
    const adBudget = ads.reduce((s,a)=>s+Number(a.budget||0),0);
    const adSpent = ads.reduce((s,a)=>s+Number(a.spent||0),0);
    const unreadMessages = messages.filter(m=>m.status==="unread").length;
    const activeContracts = contracts.filter(c=>c.status==="active").length;
    const openTasks = tasks.filter(t=>t.status==="todo"||t.status==="doing").length;
    return {newRequests,totalRequests:requests.length,activeClients,totalClients:clients.length,
      totalProjects:projects.length,visibleProjects:projects.filter(p=>p.is_visible).length,totalRevenue,
      adBudget,adSpent,adRemaining:adBudget-adSpent,unreadMessages,activeContracts,openTasks,
      recentRequests:requests.slice(0,5),recentMessages:messages.slice(0,5),
      recentTasks:tasks.filter(t=>t.status!=="done").slice(0,5)};
  },
  async resetAll() { throw new Error("تم تعطيل إعادة التعيين لحماية بيانات Supabase. احذف السجلات يدوياً عند الحاجة."); },
  async exportAll() {
    const dump = {};
    for (const key of TABLES) dump[key] = SINGLETONS[key] ? await fetchSingleton(key) : await API.list(key);
    return dump;
  },
  async importAll(data) {
    for (const key of Object.keys(data || {})) {
      if (!TABLES.has(key)) continue;
      if (SINGLETONS[key]) await saveSingleton(key, data[key]);
      else {
        // Explicitly replace only the selected collection during an import.
        unwrap(await db().from(key).delete().neq("id", "__never_match__"));
        if (Array.isArray(data[key]) && data[key].length) unwrap(await db().from(key).insert(data[key]));
      }
    }
    return true;
  },
  async publishSitePublicData() { return true; },
  async publishProjectsForTracking() { return true; },
  ensureProjectToken(project) {
    if (project.public_token) return project;
    return {...project, public_token:"trk_"+Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4)};
  },
  async notifyWhatsAppNewRequest(request) {
    const s = await API.getSettings();
    if (s.notify_whatsapp === false) return null;
    let phone = String(s.whatsapp || s.phone || "").replace(/\D/g, "");
    if (!phone) return null;
    if (phone.startsWith("0")) phone = "213" + phone.slice(1);
    const lines = ["🔔 طلب جديد — AutoDev Agency","الاسم: "+(request.name||"—"),
      "البريد: "+(request.email||"—"),"الهاتف: "+(request.phone||"—"),
      "الخدمة: "+(request.service||"—"),"الوصف: "+(request.description||"—")];
    return "https://wa.me/"+phone+"?text="+encodeURIComponent(lines.join("\n"));
  },
  async getNotifications() {
    const [requests,messages,contracts,tasks] = await Promise.all([API.list("requests"),API.list("messages"),API.list("contracts"),API.list("tasks")]);
    const items=[];
    requests.filter(r=>r.status==="new").forEach(r=>items.push({id:"n_req_"+r.id,type:"request",title:r.name||"طلب جديد",body:r.service||"",at:r.created_at||r.updated_at,link:"requests"}));
    messages.filter(m=>m.status==="unread"||m.status==="new").forEach(m=>items.push({id:"n_msg_"+m.id,type:"message",title:m.name||m.email||"رسالة",body:String(m.subject||m.message||"").slice(0,80),at:m.created_at,link:"messages"}));
    const now=Date.now();
    contracts.filter(c=>c.status==="active"&&c.end_date).forEach(c=>{const days=Math.ceil((new Date(c.end_date)-now)/86400000);if(days>=0&&days<=30)items.push({id:"n_ctr_"+c.id,type:"contract",title:c.title||"عقد",body:"ينتهي خلال "+days+" يوم",at:c.end_date,link:"contracts"});});
    tasks.filter(t=>t.status!=="done"&&t.due_date&&new Date(t.due_date)<now).forEach(t=>items.push({id:"n_task_"+t.id,type:"task",title:t.title||"مهمة",body:"متأخرة",at:t.due_date,link:"tasks"}));
    return items.sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));
  },
  async getRolePermissions(role) {
    const map = await fetchSingleton("role_permissions");
    return map[role] || map.manager || [];
  },
  async updateRolePermissions(role, perms) {
    const map = await fetchSingleton("role_permissions");
    map[role] = perms;
    return saveSingleton("role_permissions", map);
  }
};
window.API = API;
window.DEFAULT_DATA = {};
