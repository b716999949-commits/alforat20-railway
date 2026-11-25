// Alfurat Mobile | Cloudflare Pages advanced-mode Worker
const initialSql = [
  "CREATE TABLE IF NOT EXISTS hosting_meta (version INTEGER PRIMARY KEY)",
  "CREATE TABLE IF NOT EXISTS `orders` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`customer_id` text, `customer_name` text NOT NULL,\n\t`phone` text NOT NULL,\n\t`city` text NOT NULL,\n\t`address` text NOT NULL,\n\t`note` text NOT NULL,\n\t`payment_method` text NOT NULL,\n\t`items_json` text NOT NULL,\n\t`total` real NOT NULL,\n\t`status` text NOT NULL,\n\t`created_at` text NOT NULL\n)",
  "CREATE TABLE IF NOT EXISTS `products` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`name` text NOT NULL,\n\t`category` text NOT NULL,\n\t`description` text DEFAULT '' NOT NULL,\n\t`price` real DEFAULT 0 NOT NULL,\n\t`old_price` real DEFAULT 0 NOT NULL,\n\t`image_url` text DEFAULT '' NOT NULL,\n\t`badge` text DEFAULT '' NOT NULL,\n\t`featured` integer DEFAULT 0 NOT NULL,\n\t`stock` integer DEFAULT -1 NOT NULL,\n\t`created_at` text NOT NULL,\n\t`brand` text DEFAULT '' NOT NULL,\n\t`model` text DEFAULT '' NOT NULL,\n\t`sku` text DEFAULT '' NOT NULL,\n\t`specs_json` text DEFAULT '{}' NOT NULL,\n\t`product_url` text DEFAULT '' NOT NULL,\n\t`video_url` text DEFAULT '' NOT NULL,\n\t`external_id` text DEFAULT '' NOT NULL,\n\t`source` text DEFAULT 'manual' NOT NULL\n)",
  "CREATE INDEX IF NOT EXISTS `idx_products_external_id` ON `products` (`external_id`)",
  "CREATE INDEX IF NOT EXISTS `idx_products_sku` ON `products` (`sku`)",
  "CREATE TABLE IF NOT EXISTS `settings` (\n\t`key` text PRIMARY KEY NOT NULL,\n\t`value` text NOT NULL\n)",
  "CREATE TABLE IF NOT EXISTS `social_posts` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`title` text NOT NULL,\n\t`description` text DEFAULT '' NOT NULL,\n\t`post_type` text DEFAULT 'advert' NOT NULL,\n\t`source` text DEFAULT 'facebook' NOT NULL,\n\t`url` text DEFAULT '' NOT NULL,\n\t`image_url` text DEFAULT '' NOT NULL,\n\t`created_at` text NOT NULL\n)",
  "CREATE TABLE IF NOT EXISTS `videos` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`title` text NOT NULL,\n\t`url` text NOT NULL,\n\t`description` text DEFAULT '' NOT NULL,\n\t`thumbnail_url` text DEFAULT '' NOT NULL,\n\t`created_at` text NOT NULL\n)",
  "CREATE TABLE IF NOT EXISTS `customers` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`email` text NOT NULL,\n\t`name` text DEFAULT '' NOT NULL,\n\t`phone` text DEFAULT '' NOT NULL,\n\t`city` text DEFAULT '' NOT NULL,\n\t`address` text DEFAULT '' NOT NULL,\n\t`created_at` text NOT NULL,\n\t`updated_at` text NOT NULL\n);",
  "CREATE TABLE IF NOT EXISTS login_accounts (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, password_hash TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS login_sessions (token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, owner_stamp TEXT NOT NULL, expires INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_login_expiry ON login_sessions(expires)",
  "CREATE TABLE IF NOT EXISTS login_limits (id TEXT PRIMARY KEY, period INTEGER NOT NULL, hits INTEGER NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_login_window ON login_limits(period)",
  "CREATE TABLE IF NOT EXISTS image_chunks (image_id TEXT NOT NULL, part INTEGER NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, PRIMARY KEY(image_id,part))",
  "INSERT OR IGNORE INTO products (id,name,category,description,price,old_price,image_url,badge,featured,stock,created_at,brand,model,sku,specs_json,product_url,video_url,external_id,source) SELECT * FROM (SELECT 'furat_buds_sport','سماعات رياضية لاسلكية','السماعات','سماعات خفيفة للاستخدام اليومي والرياضة. نموذج عرض قابل للتعديل.',0,0,'/static/assets/products/buds-sport.svg','',0,-1,'2026-11-22T12:49:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_cable_lightning','كيبل شحن آيفون','الإكسسوارات','كيبل متوافق مع الطراز المطلوب؛ تأكد من نوع منفذ هاتفك.',0,0,'/static/assets/products/cable-lightning.svg','',0,-1,'2026-11-22T12:42:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_cable_usbc','كيبل USB-C للشحن والبيانات','الإكسسوارات','كيبل للبيانات والشحن بمقاسات متعددة؛ اختر النوع والطول المطلوب.',0,0,'/static/assets/products/cable-usbc.svg','',0,-1,'2026-11-22T12:43:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_car','حامل وشاحن سيارة','إكسسوارات السيارات','ملحقات للجوال داخل السيارة، تتفاوت بحسب النوع والتوافق.',0,0,'/static/assets/products/car.svg','',0,-1,'2026-11-22T12:37:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_cases','كفرات وحافظات حماية','الإكسسوارات','كفرات بألوان وتصاميم مختلفة للهواتف؛ اختر طراز جهازك.',0,0,'/static/assets/products/cases.svg','',0,-1,'2026-11-22T12:41:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_charger_gan','شاحن جداري سريع USB-C','الشواحن','شاحن حائط USB-C. تأكد من قدرة الشحن والتوافق مع جهازك قبل الطلب.',0,0,'/static/assets/products/charger-gan.svg','ملحقات',1,-1,'2026-11-22T12:45:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_earbuds_pro','سماعات بلوتوث لاسلكية TWS','السماعات','سماعات لاسلكية داخل الأذن مع علبة شحن. تأكد من النسخة والمزايا قبل الشراء.',0,0,'/static/assets/products/earbuds-pro.svg','الأكثر طلباً',1,-1,'2026-11-22T12:51:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_headset','سماعة رأس بلوتوث','السماعات','سماعات رأس للترفيه والمكالمات، بعدة تصاميم. صورة توضيحية.',0,0,'/static/assets/products/headset.svg','',0,-1,'2026-11-22T12:50:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_iphone_premium','هواتف آيفون – تشكيلات متعددة','الهواتف','عرض توضيحي لقسم آيفون. حدّد الموديل والسعة والحالة المطلوبة للاستفسار عن المتوفر.',0,0,'/static/assets/products/iphone-premium.svg','حسب التوفر',1,-1,'2026-11-22T12:55:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_m10i','هاتف M10 i','الهواتف','هاتف M10 i من عروض الفرات موبايل السابقة. اطلب تفاصيل الضمان والسعة واللون. | المواصفات المذكورة مستخرجة من إعلان سابق للمتجر، وتحتاج تأكيد الإصدار والتوفر قبل الشراء.',0,0,'/static/assets/products/m10i.webp','من عروضنا',1,-1,'2026-11-22T12:57:00+00:00','','M10 i','','{\"الشاشة\":\"6.56 بوصة IPS HD+، معدل 90Hz\",\"المعالج\":\"MediaTek G50\",\"الذاكرة الداخلية\":\"128GB\",\"الذاكرة العشوائية\":\"10GB مذكورة في الإعلان (4+6)\",\"الكاميرا\":\"13MP\",\"البطارية\":\"5000mAh\",\"نظام التشغيل\":\"Android 16\",\"الشرائح\":\"2 SIM + SD\"}','','','','store-ad-previous' UNION ALL SELECT 'furat_m45s','هاتف M45S','الهواتف','هاتف M45S بتصميم أنيق وخيارات ألوان متعددة حسب الإعلان. تأكد من التوفر والسعر قبل الطلب. | المواصفات المذكورة مستخرجة من إعلان سابق للمتجر، وتحتاج تأكيد الإصدار والتوفر قبل الشراء.',0,0,'/static/assets/products/m45s.webp','من عروضنا',1,-1,'2026-11-22T12:58:00+00:00','','M45S','','{\"الشاشة\":\"6.78 بوصة HD+، معدل 120Hz\",\"المعالج\":\"MTK G100\",\"الذاكرة الداخلية\":\"256GB\",\"الذاكرة العشوائية\":\"16GB مذكورة في الإعلان (8+8)\",\"الكاميرا\":\"50MP\",\"البطارية\":\"7000mAh\",\"نظام التشغيل\":\"Android 16\",\"الشحن\":\"18W\",\"الشرائح\":\"Dual SIM\",\"الشبكات\":\"4G / 3G / 2G / 1X\",\"منفذ السماعات\":\"3.5mm\"}','','','','store-ad-previous' UNION ALL SELECT 'furat_m60_plus','M60 PLUS','الهواتف','هاتف M60 PLUS كما ظهر في إعلانات الفرات موبايل. اسأل عن النسخ المتاحة والمواصفات والسعر. | المواصفات المذكورة مستخرجة من إعلان سابق للمتجر، وتحتاج تأكيد الإصدار والتوفر قبل الشراء.',0,0,'/static/assets/products/m60-plus.webp','من عروضنا',1,-1,'2026-11-22T12:59:00+00:00','','M60 PLUS','','{\"الشاشة\":\"6.72 بوصة IPS FHD+، معدل 120Hz\",\"المعالج\":\"MediaTek Helio G100\",\"الذاكرة الداخلية\":\"512GB\",\"الذاكرة العشوائية\":\"16GB مذكورة في الإعلان (8+8 افتراضية)\",\"الكاميرا\":\"64MP\",\"البطارية\":\"6000mAh\",\"نظام التشغيل\":\"Android 15\",\"الشرائح\":\"2 SIM\"}','','','','store-ad-previous' UNION ALL SELECT 'furat_powerbank_compact','باور بانك متنقل متعدد المنافذ','الباور بانك','حل عملي للشحن أثناء التنقل، مع خيارات سعات مختلفة حسب المتوفر.',0,0,'/static/assets/products/powerbank-compact.svg','',0,-1,'2026-11-22T12:46:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_romoss_j35','باور بانك راموس J35 – 40000mAh','الباور بانك','بطارية متنقلة راموس J35 بسعة 40000mAh كما ورد في الإعلان. تحقق من المنافذ والإصدار. | المواصفات المذكورة مستخرجة من إعلان سابق للمتجر، وتحتاج تأكيد الإصدار والتوفر قبل الشراء.',0,0,'/static/assets/products/romoss-j35.webp','من عروضنا',1,-1,'2026-11-22T12:56:00+00:00','ROMOSS','J35','','{\"السعة\":\"40000mAh\",\"المخارج\":\"USB وType-C وموصل Lightning مذكورة في الإعلان\",\"الشحن\":\"يدعم الشحن السريع وفق الإعلان\",\"الشاشة\":\"شاشة رقمية لعرض نسبة الشحن\"}','','','','store-ad-previous' UNION ALL SELECT 'furat_samsung','هواتف سامسونج جالاكسي','الهواتف','فئات Galaxy متنوعة. هذا منتج توضيحي لحين إدخال الموديلات والأسعار الحقيقية.',0,0,'/static/assets/products/samsung.svg','حسب التوفر',1,-1,'2026-11-22T12:54:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_speaker','سماعة بلوتوث محمولة','السماعات','سماعة محمولة للاستخدام اليومي. التفاصيل والسعر حسب الموديل المتوفر.',0,0,'/static/assets/products/speaker.svg','',0,-1,'2026-11-22T12:39:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_stand','حامل هاتف مكتبي','الإكسسوارات','حامل عملي للهاتف على المكتب. صورة توضيحية.',0,0,'/static/assets/products/stand.svg','',0,-1,'2026-11-22T12:38:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_tecno','هواتف تكنو وإنفينيكس','الهواتف','هواتف عملية للاستخدام اليومي. أضف صور ومواصفات المنتجات المتوفرة من لوحة التحكم.',0,0,'/static/assets/products/tecno.svg','تشكيلة',0,-1,'2026-11-22T12:52:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_tempered','زجاج حماية للشاشة','الإكسسوارات','حماية للشاشة حسب قياس الهاتف وطرازه. صورة توضيحية.',0,0,'/static/assets/products/tempered.svg','',0,-1,'2026-11-22T12:40:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_watch','ساعة ذكية متعددة الوظائف','الساعات الذكية','ساعات ذكية بتصاميم مختلفة. تحقق من التوافق والمميزات بحسب الموديل.',0,0,'/static/assets/products/watch.svg','اختيارات ذكية',1,-1,'2026-11-22T12:48:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_watch_sport','ساعة رياضية ذكية','الساعات الذكية','ساعة رياضية بواجهة أنيقة؛ الصورة للتوضيح والمواصفات بحسب الموديل.',0,0,'/static/assets/products/watch-sport.svg','',0,-1,'2026-11-22T12:47:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_wireless_charger','شاحن لاسلكي للهاتف','الشواحن','قاعدة شحن لاسلكية بتصميم عصري؛ يلزم التأكد من توافق الجهاز.',0,0,'/static/assets/products/wireless-charger.svg','',0,-1,'2026-11-22T12:44:00+00:00','','','','{}','','','','initial-display' UNION ALL SELECT 'furat_xiaomi','هواتف شاومي وريدمي','الهواتف','اختيارات من فئات Xiaomi وRedmi. تأكد من الموديل والسعر والإصدار المتاح.',0,0,'/static/assets/products/xiaomi.svg','تشكيلة',0,-1,'2026-11-22T12:53:00+00:00','','','','{}','','','','initial-display') WHERE NOT EXISTS (SELECT version FROM hosting_meta WHERE version=1)",
  "INSERT OR IGNORE INTO social_posts (id,title,description,post_type,source,url,image_url,created_at) SELECT * FROM (SELECT 'creative_m10i','إعلان هاتف M10 i','تصميم إعلاني سابق للمتجر — تأكد من النسخة المتوفرة.','advert','store_creative','','/static/assets/ads/m10i.webp','2026-11-22T00:00:00Z' UNION ALL SELECT 'creative_m45s','إعلان هاتف M45S','تصميم إعلاني سابق للمتجر — راجع المواصفات قبل الشراء.','advert','store_creative','','/static/assets/ads/m45s.webp','2026-11-22T00:00:00Z' UNION ALL SELECT 'creative_m60-plus','إعلان هاتف M60 PLUS','تصميم إعلاني سابق للمتجر — استفسر عن السعر والتوفر.','advert','store_creative','','/static/assets/ads/m60-plus.webp','2026-11-22T00:00:00Z' UNION ALL SELECT 'creative_romoss-j35','إعلان باور بانك راموس','تصميم إعلاني سابق للمتجر — استفسر عن التوفر.','advert','store_creative','','/static/assets/ads/romoss-j35.webp','2026-11-22T00:00:00Z') WHERE NOT EXISTS (SELECT version FROM hosting_meta WHERE version=1)",
  "INSERT OR IGNORE INTO settings (key,value) SELECT * FROM (SELECT 'address','صنعاء - شميلة - مول غزة' UNION ALL SELECT 'announcement','الفرات موبايل — هواتف ذكية وإكسسوارات بتصميم جديد وألوان الشعار' UNION ALL SELECT 'app_url','https://play.google.com/store/apps/details?id=com.forat.storeapp' UNION ALL SELECT 'currency','ر.ي' UNION ALL SELECT 'delivery_text','استفسر عن خيارات التوصيل عند تأكيد الطلب' UNION ALL SELECT 'facebook','https://www.facebook.com/share/1EAKxFBzAi/' UNION ALL SELECT 'facebook_page_url','' UNION ALL SELECT 'hero_description','اكتشف الهواتف الذكية والسماعات والإكسسوارات ومستلزمات الجوال في تجربة تسوق أنيقة وسهلة.' UNION ALL SELECT 'hero_title','تقنيتك تبدأ من هنا' UNION ALL SELECT 'instagram','' UNION ALL SELECT 'logo_url','' UNION ALL SELECT 'payment_text','الدفع عند الاستلام أو التحويل بعد تأكيد الطلب' UNION ALL SELECT 'phone','' UNION ALL SELECT 'snapchat','' UNION ALL SELECT 'store_name','الفرات موبايل' UNION ALL SELECT 'store_seed_version','2026-11-22-v1' UNION ALL SELECT 'store_subtitle','عالم التقنية بين يديك' UNION ALL SELECT 'telegram','' UNION ALL SELECT 'tiktok','' UNION ALL SELECT 'whatsapp','' UNION ALL SELECT 'x','' UNION ALL SELECT 'youtube','') WHERE NOT EXISTS (SELECT version FROM hosting_meta WHERE version=1)",
  "INSERT OR IGNORE INTO hosting_meta (version) VALUES (1)"
];

const settingsKeys = [
    "address",
    "announcement",
    "app_url",
    "currency",
    "delivery_text",
    "facebook",
    "facebook_page_url",
    "hero_description",
    "hero_title",
    "instagram",
    "logo_url",
    "payment_text",
    "phone",
    "snapchat",
    "store_name",
    "store_subtitle",
    "telegram",
    "tiktok",
    "whatsapp",
    "x",
    "youtube"
];
const statuses = [
    'جديد',
    'قيد التجهيز',
    'تم الشحن',
    'مكتمل',
    'ملغي'
];
const payments = [
    'عند الاستلام',
    'تحويل بنكي / محفظة',
    'الاتفاق مع المتجر'
];
const columns = 'id,name,category,description,price,old_price,image_url,badge,featured,stock,created_at,brand,model,sku,specs_json,product_url,video_url,external_id,source';
const insertSql = `INSERT INTO products (${columns}) VALUES (${Array(19).fill('?').join(',')})`;
const updateSql = 'UPDATE products SET name=?,category=?,description=?,price=?,old_price=?,image_url=?,badge=?,featured=?,stock=?,brand=?,model=?,sku=?,specs_json=?,product_url=?,video_url=?,external_id=?,source=? WHERE id=?';
const uid = (prefix)=>`${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
const now = ()=>new Date().toISOString();
const json = (data, status = 200)=>new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
const fail = (detail, status = 422)=>json({
        detail
    }, status);
const object = (x)=>x !== null && typeof x === 'object' && !Array.isArray(x);
const string = (x, min = 0, max = 1500)=>typeof x === 'string' && x.trim().length >= min && x.length <= max;
const number = (x, min, max)=>typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max;
const idSafe = (x)=>/^[A-Za-z0-9_-]{1,100}$/.test(x);
function safeLink(x, internal = false) {
    if (x === '') return true;
    if (!string(x, 1, 1500)) return false;
    if (internal && /^\/uploads\/[a-f0-9]{32}\.(?:jpg|png|webp)$/.test(x)) return true;
    if (internal && /^\/static\/assets\/(?:products|ads)\/[a-z0-9-]+\.(?:svg|webp)$/.test(x)) return true;
    try {
        const u = new URL(x);
        return (u.protocol === 'https:' || u.protocol === 'http:') && !u.username && !u.password;
    } catch  {
        return false;
    }
}
async function all(db, sql, ...args) {
    return (await db.prepare(sql).bind(...args).all()).results;
}
async function one(db, sql, ...args) {
    return db.prepare(sql).bind(...args).first();
}
async function readSettings(db) {
    const result = {};
    for (const p of (await all(db, 'SELECT key,value FROM settings')))if (settingsKeys.includes(p.key)) result[p.key] = p.value;
    return result;
}
async function readProducts(db) {
    return (await all(db, 'SELECT * FROM products ORDER BY featured DESC, created_at DESC')).map((p)=>{
        const { specs_json, ...rest } = p;
        let specs = {};
        try {
            specs = JSON.parse(specs_json || '{}');
        } catch  {}
        return {
            ...rest,
            specs
        };
    });
}
const readVideos = (db)=>all(db, 'SELECT * FROM videos ORDER BY created_at DESC');
const readSocial = (db)=>all(db, 'SELECT * FROM social_posts ORDER BY created_at DESC,id DESC');
function identity(request) {
    const id = request.headers.get('oai-authenticated-user-id'), email = request.headers.get('oai-authenticated-user-email');
    return id && email ? {
        id,
        email
    } : null;
}
function sameOrigin(request) {
    const origin = request.headers.get('Origin'), site = request.headers.get('Sec-Fetch-Site');
    return (!origin || origin === new URL(request.url).origin) && site !== 'cross-site' && request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json');
}
async function authorize(request, env) {
    const userId = request.headers.get('oai-authenticated-user-id');
    if (!userId) return fail('يرجى تسجيل الدخول', 401);
    const email = request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
    const adminEmails = [
        env.ADMIN_EMAIL,
        env.ADMIN_OWNER_EMAIL
    ].filter(Boolean).map((value)=>value.trim().toLowerCase());
    if (!email || !adminEmails.includes(email)) return fail('هذه اللوحة مخصصة لصاحب المتجر', 403);
    if (![
        'GET',
        'HEAD'
    ].includes(request.method)) {
        const origin = request.headers.get('Origin'), site = request.headers.get('Sec-Fetch-Site');
        if (origin && origin !== new URL(request.url).origin || site === 'cross-site') return fail('مصدر الطلب غير مسموح', 403);
        if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return fail('نوع البيانات غير صالح', 415);
    }
    return null;
}
async function body(request) {
    try {
        const x = await request.json();
        return object(x) ? x : null;
    } catch  {
        return null;
    }
}
function product(raw) {
    const p = raw, price = p.price ?? 0, old = p.old_price ?? 0, stock = p.stock ?? -1, specs = p.specs ?? {};
    if (!string(p.name, 2, 140) || !string(p.category, 2, 65) || !string(p.description ?? '', 0, 3000) || !string(p.badge ?? '', 0, 40)) return null;
    if (!number(price, 0, 1e12) || !number(old, 0, 1e12) || !Number.isInteger(stock) || !number(stock, -1, 1e6)) return null;
    for (const key of [
        'brand',
        'model',
        'sku',
        'external_id',
        'source'
    ])if (!string(p[key] ?? '', 0, key === 'external_id' ? 150 : 100)) return null;
    for (const key of [
        'image_url',
        'product_url',
        'video_url'
    ])if (!safeLink(p[key] ?? '', key === 'image_url')) return null;
    if (!object(specs) || Object.keys(specs).length > 36 || Object.entries(specs).some(([k, v])=>k.length > 95 || !string(v, 0, 500))) return null;
    return {
        name: p.name.trim(),
        category: p.category.trim(),
        description: String(p.description ?? '').trim(),
        price,
        old_price: old,
        image_url: p.image_url ?? '',
        badge: String(p.badge ?? '').trim(),
        featured: p.featured ? 1 : 0,
        stock,
        brand: String(p.brand ?? '').trim(),
        model: String(p.model ?? '').trim(),
        sku: String(p.sku ?? '').trim(),
        specs_json: JSON.stringify(specs),
        product_url: p.product_url ?? '',
        video_url: p.video_url ?? '',
        external_id: String(p.external_id ?? '').trim(),
        source: String(p.source ?? 'manual')
    };
}
function values(p, id, created) {
    return [
        id,
        p.name,
        p.category,
        p.description,
        p.price,
        p.old_price,
        p.image_url,
        p.badge,
        p.featured,
        p.stock,
        created,
        p.brand,
        p.model,
        p.sku,
        p.specs_json,
        p.product_url,
        p.video_url,
        p.external_id,
        p.source
    ];
}
function updateValues(p, id) {
    const v = values(p, id, '');
    return [
        ...v.slice(1, 10),
        ...v.slice(11),
        id
    ];
}
function video(p) {
    return string(p.title, 2, 140) && string(p.description ?? '', 0, 1500) && safeLink(p.url) && p.url && safeLink(p.thumbnail_url ?? '') ? {
        title: p.title.trim(),
        url: p.url,
        description: p.description ?? '',
        thumbnail_url: p.thumbnail_url ?? ''
    } : null;
}
function social(p) {
    return string(p.title, 2, 140) && string(p.description ?? '', 0, 1500) && [
        'advert',
        'video',
        'post'
    ].includes(p.post_type ?? 'advert') && [
        'facebook',
        'store_creative'
    ].includes(p.source ?? 'facebook') && safeLink(p.url ?? '') && safeLink(p.image_url ?? '', true) ? {
        title: p.title.trim(),
        description: p.description ?? '',
        post_type: p.post_type ?? 'advert',
        source: p.source ?? 'facebook',
        url: p.url ?? '',
        image_url: p.image_url ?? ''
    } : null;
}
async function upload(p, env) {
    if (!string(p.data, 1, 6_000_000)) return fail('حجم الصورة كبير جداً');
    try {
        const matched = String(p.data).match(/^data:image\/(png|jpeg|webp);base64,([\s\S]*)$/);
        if (!matched) return fail('الصورة غير صالحة');
        const binary = atob(matched[2]);
        if (binary.length > 4 * 1024 * 1024) return fail('الصورة أكبر من 4MB');
        const bytes = Uint8Array.from(binary, (c)=>c.charCodeAt(0));
        const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
        const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
        const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
        if (!(jpeg || png || webp)) return fail('استخدم JPEG أو PNG أو WEBP');
        if (!env.BUCKET) return fail('حفظ الصور غير متاح', 503);
        const ext = jpeg ? 'jpg' : png ? 'png' : 'webp', type = jpeg ? 'image/jpeg' : png ? 'image/png' : 'image/webp', key = crypto.randomUUID().replaceAll('-', '') + '.' + ext;
        await env.BUCKET.put(key, bytes, {
            httpMetadata: {
                contentType: type
            }
        });
        return json({
            url: '/uploads/' + key
        });
    } catch  {
        return fail('الصورة غير صالحة');
    }
}
async function uploadedImage(request, env) {
    const key = new URL(request.url).pathname.replace(/^\/uploads\//, '');
    if (!env.BUCKET || !/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(key)) return new Response('Not found', {
        status: 404
    });
    const file = await env.BUCKET.get(key);
    if (!file) return new Response('Not found', {
        status: 404
    });
    return new Response(file.body, {
        headers: {
            'Content-Type': file.httpMetadata?.contentType || 'image/webp',
            'Cache-Control': 'public, max-age=86400'
        }
    });
}
async function handleApi(request, env) {
    const db = env.DB;
    if (!db) return fail('قاعدة البيانات غير متاحة', 503);
    const path = new URL(request.url).pathname, method = request.method;
    try {
        if (path === '/api/catalog' && method === 'GET') {
            const products = await readProducts(db);
            return json({
                settings: await readSettings(db),
                products,
                videos: await readVideos(db),
                social_posts: await readSocial(db),
                demo: products.some((p)=>!p.image_url || p.image_url.endsWith('.svg')) || products.every((p)=>!Number(p.price))
            });
        }
        if (path === '/api/account' && method === 'GET') {
            const user = identity(request);
            if (!user) return fail('يرجى تسجيل الدخول', 401);
            const profile = await one(db, 'SELECT email,name,phone,city,address,created_at FROM customers WHERE id=?', user.id);
            const orders = (await all(db, 'SELECT id,total,status,created_at,items_json FROM orders WHERE customer_id=? ORDER BY created_at DESC LIMIT 100', user.id)).map((o)=>{
                let items = [];
                try {
                    items = JSON.parse(o.items_json);
                } catch  {}
                return {
                    id: o.id,
                    total: o.total,
                    status: o.status,
                    created_at: o.created_at,
                    items
                };
            });
            return json({
                profile: profile || {
                    email: user.email,
                    name: '',
                    phone: '',
                    city: '',
                    address: ''
                },
                orders
            });
        }
        if (path === '/api/account' && method === 'PUT') {
            const user = identity(request);
            if (!user) return fail('يرجى تسجيل الدخول', 401);
            if (!sameOrigin(request)) return fail('طلب غير مسموح', 403);
            const p = await body(request);
            if (!p || !string(p.name, 2, 100) || !string(p.phone, 6, 35) || !string(p.city, 2, 100) || !string(p.address, 3, 300)) return fail('أكمل بيانات الحساب المطلوبة');
            await db.prepare('INSERT INTO customers (id,email,name,phone,city,address,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name,phone=excluded.phone,city=excluded.city,address=excluded.address,updated_at=excluded.updated_at').bind(user.id, user.email, p.name.trim(), p.phone.trim(), p.city.trim(), p.address.trim(), now(), now()).run();
            return json({
                ok: true
            });
        }
        if (path === '/api/orders' && method === 'POST') {
            if (!sameOrigin(request)) return fail('طلب غير مسموح', 403);
            const p = await body(request);
            if (!p || !string(p.customer_name, 2, 100) || !string(p.phone, 6, 35) || !string(p.city, 2, 100) || !string(p.address, 3, 300) || !string(p.note ?? '', 0, 1000) || !payments.includes(p.payment_method ?? 'عند الاستلام') || !Array.isArray(p.items) || p.items.length < 1 || p.items.length > 30) return fail('بيانات الطلب غير مكتملة');
            if (p.items.some((x)=>!object(x) || !string(x.id, 1, 70) || !Number.isInteger(x.quantity) || !number(x.quantity, 1, 99))) return fail('المنتجات أو الكميات غير صالحة');
            const ids = p.items.map((x)=>x.id);
            if (new Set(ids).size !== ids.length) return fail('منتجات مكررة في الطلب');
            const selected = await Promise.all(ids.map((id)=>one(db, 'SELECT id,name,price,stock FROM products WHERE id=?', id)));
            if (selected.some((x)=>!x)) return fail('أحد المنتجات لم يعد متاحاً');
            let total = 0;
            const items = [];
            for(let i = 0; i < selected.length; i++){
                const item = selected[i], quantity = p.items[i].quantity;
                if (item.stock === 0 || item.stock !== -1 && quantity > item.stock) return fail('الكمية المطلوبة غير متوفرة: ' + item.name);
                const subtotal = Math.round(item.price * quantity * 100) / 100;
                total = Math.round((total + subtotal) * 100) / 100;
                items.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity,
                    subtotal
                });
            }
            const orderId = 'FUR-' + now().slice(2, 10).replaceAll('-', '') + '-' + crypto.randomUUID().slice(0, 6).toUpperCase();
            const customer = identity(request);
            await db.prepare('INSERT INTO orders (id,customer_name,phone,city,address,note,payment_method,items_json,total,status,created_at,customer_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(orderId, p.customer_name.trim(), p.phone.trim(), p.city.trim(), p.address.trim(), String(p.note ?? '').trim(), p.payment_method ?? 'عند الاستلام', JSON.stringify(items), total, 'جديد', now(), customer?.id ?? null).run();
            return json({
                ok: true,
                order_id: orderId,
                total,
                items
            });
        }
        if (!path.startsWith('/api/admin/')) return fail('غير موجود', 404);
        const denied = await authorize(request, env);
        if (denied) return denied;
        if (path === '/api/admin/me' && method === 'GET') return json({
            ok: true,
            csrf: 'site-identity'
        });
        if (path === '/api/admin/data' && method === 'GET') {
            const orders = (await all(db, 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 500')).map((o)=>{
                const { items_json, ...rest } = o;
                let items = [];
                try {
                    items = JSON.parse(items_json);
                } catch  {}
                return {
                    ...rest,
                    items
                };
            });
            const customers = await all(db, 'SELECT c.id,c.email,c.name,c.phone,c.city,c.created_at,COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY c.created_at DESC LIMIT 500');
            return json({
                settings: await readSettings(db),
                products: await readProducts(db),
                videos: await readVideos(db),
                social_posts: await readSocial(db),
                orders,
                customers
            });
        }
        if (path === '/api/admin/settings' && method === 'PUT') {
            const p = await body(request);
            if (!p) return fail('بيانات غير صالحة');
            const statements = [];
            for (const [key, value] of Object.entries(p)){
                if (!settingsKeys.includes(key)) continue;
                if (!string(value, 0, 1600) || /^(logo_url|instagram|facebook|facebook_page_url|tiktok|youtube|telegram|snapchat|x|app_url)$/.test(key) && !safeLink(value, key === 'logo_url')) return fail('قيمة غير صالحة: ' + key);
                statements.push(db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, String(value).trim()));
            }
            if (statements.length) await db.batch(statements);
            return json({
                ok: true
            });
        }
        const productPath = path.match(/^\/api\/admin\/products(?:\/([^/]+))?$/);
        if (productPath) {
            const id = productPath[1] ? decodeURIComponent(productPath[1]) : '';
            if (id && !idSafe(id)) return fail('معرّف غير صالح');
            if (method === 'DELETE' && id) {
                const r = await db.prepare('DELETE FROM products WHERE id=?').bind(id).run();
                return r.meta.changes ? json({
                    ok: true
                }) : fail('المنتج غير موجود', 404);
            }
            if (method === 'POST' && !id || method === 'PUT' && id) {
                const raw = await body(request), p = raw && product(raw);
                if (!p) return fail('بيانات المنتج غير صالحة');
                if (method === 'POST') {
                    const newId = uid('prd');
                    await db.prepare(insertSql).bind(...values(p, newId, now())).run();
                    return json({
                        ok: true,
                        id: newId
                    });
                }
                const r = await db.prepare(updateSql).bind(...updateValues(p, id)).run();
                return r.meta.changes ? json({
                    ok: true
                }) : fail('المنتج غير موجود', 404);
            }
        }
        const videoPath = path.match(/^\/api\/admin\/videos(?:\/([^/]+))?$/);
        if (videoPath) {
            const id = videoPath[1] ? decodeURIComponent(videoPath[1]) : '';
            if (id && !idSafe(id)) return fail('معرّف غير صالح');
            if (method === 'DELETE' && id) {
                const r = await db.prepare('DELETE FROM videos WHERE id=?').bind(id).run();
                return r.meta.changes ? json({
                    ok: true
                }) : fail('الفيديو غير موجود', 404);
            }
            if (method === 'POST' && !id || method === 'PUT' && id) {
                const raw = await body(request), p = raw && video(raw);
                if (!p) return fail('بيانات الفيديو غير صالحة');
                if (method === 'POST') {
                    const newId = uid('vid');
                    await db.prepare('INSERT INTO videos (id,title,url,description,thumbnail_url,created_at) VALUES (?,?,?,?,?,?)').bind(newId, p.title, p.url, p.description, p.thumbnail_url, now()).run();
                    return json({
                        ok: true,
                        id: newId
                    });
                }
                const r = await db.prepare('UPDATE videos SET title=?,url=?,description=?,thumbnail_url=? WHERE id=?').bind(p.title, p.url, p.description, p.thumbnail_url, id).run();
                return r.meta.changes ? json({
                    ok: true
                }) : fail('الفيديو غير موجود', 404);
            }
        }
        const socialPath = path.match(/^\/api\/admin\/social-posts(?:\/([^/]+))?$/);
        if (socialPath) {
            const id = socialPath[1] ? decodeURIComponent(socialPath[1]) : '';
            if (id && !idSafe(id)) return fail('معرّف غير صالح');
            if (method === 'DELETE' && id) {
                const r = await db.prepare('DELETE FROM social_posts WHERE id=?').bind(id).run();
                return r.meta.changes ? json({
                    ok: true
                }) : fail('المنشور غير موجود', 404);
            }
            if (method === 'POST' && !id || method === 'PUT' && id) {
                const raw = await body(request), p = raw && social(raw);
                if (!p) return fail('بيانات المنشور غير صالحة');
                if (method === 'POST') {
                    const newId = uid('social');
                    await db.prepare('INSERT INTO social_posts (id,title,description,post_type,source,url,image_url,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(newId, p.title, p.description, p.post_type, p.source, p.url, p.image_url, now()).run();
                    return json({
                        ok: true,
                        id: newId
                    });
                }
                const r = await db.prepare('UPDATE social_posts SET title=?,description=?,post_type=?,source=?,url=?,image_url=? WHERE id=?').bind(p.title, p.description, p.post_type, p.source, p.url, p.image_url, id).run();
                return r.meta.changes ? json({
                    ok: true
                }) : fail('المنشور غير موجود', 404);
            }
        }
        if (path === '/api/admin/upload' && method === 'POST') {
            const p = await body(request);
            return p ? upload(p, env) : fail('الصورة غير صالحة');
        }
        if (path === '/api/admin/import' && method === 'POST') {
            const p = await body(request), records = p?.products;
            if (!Array.isArray(records) || records.length < 1 || records.length > 1000 || ![
                'merge',
                'append'
            ].includes(p?.mode ?? 'merge')) return fail('ملف استيراد غير صالح');
            const validated = records.map((x)=>object(x) ? product(x) : null);
            if (validated.some((x)=>!x)) return fail('بيانات أحد المنتجات غير صالحة');
            const existing = await all(db, 'SELECT id,external_id,sku FROM products'), byExternal = new Map(existing.filter((x)=>x.external_id).map((x)=>[
                    x.external_id,
                    x.id
                ])), bySku = new Map(existing.filter((x)=>x.sku).map((x)=>[
                    x.sku,
                    x.id
                ]));
            const products = [];
            let added = 0, updated = 0;
            for (const item of validated){
                const x = item;
                const match = p?.mode === 'append' ? null : x.external_id && byExternal.get(x.external_id) || x.sku && bySku.get(x.sku);
                const id = match || uid('prd');
                if (match) updated++;
                else {
                    added++;
                    if (x.external_id) byExternal.set(x.external_id, id);
                    if (x.sku) bySku.set(x.sku, id);
                }
                products.push(values({
                    ...x,
                    source: !match && x.source === 'manual' ? 'import' : x.source
                }, id, now()));
            }
            const fields = columns.split(',');
            const selectors = fields.map((_, index)=>"json_extract(value,'$[" + index + "]')").join(',');
            const updates = fields.filter((field)=>field !== 'id' && field !== 'created_at').map((field)=>field + '=excluded.' + field).join(',');
            const query = 'INSERT INTO products (' + columns + ') SELECT ' + selectors + ' FROM json_each(?) WHERE 1 ON CONFLICT(id) DO UPDATE SET ' + updates;
            const writes = [];
            for(let i = 0; i < products.length; i += 32)writes.push(db.prepare(query).bind(JSON.stringify(products.slice(i, i + 32))));
            await db.batch(writes);
            return json({
                ok: true,
                added,
                updated,
                total: validated.length
            });
        }
        const orderPath = path.match(/^\/api\/admin\/orders\/([^/]+)$/);
        if (orderPath && method === 'PATCH') {
            const id = decodeURIComponent(orderPath[1]), p = await body(request);
            if (!idSafe(id) || !p || !statuses.includes(p.status)) return fail('حالة غير صالحة');
            const r = await db.prepare('UPDATE orders SET status=? WHERE id=?').bind(p.status, id).run();
            return r.meta.changes ? json({
                ok: true
            }) : fail('الطلب غير موجود', 404);
        }
        return fail('غير موجود', 404);
    } catch (error) {
        console.error('Store API error', error);
        return fail('تعذر إكمال العملية، حاول مرة أخرى', 500);
    }
}

const bytes = new TextEncoder();
const internalOwner = 'store-owner@store.invalid';
const cookieName = '__Host-furat_session';
const hex = buffer => Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2,'0')).join('');
const unhex = value => Uint8Array.from(value.match(/../g), pair => parseInt(pair,16));
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const digest = async value => hex(await crypto.subtle.digest('SHA-256', bytes.encode(value)));
const timestamp = () => Math.floor(Date.now()/1000);

async function initializeStore(db) {
  try {
    if (await db.prepare("SELECT version FROM hosting_meta WHERE version=1").first()) return;
  } catch (error) {
    if (!String(error.message).includes('no such table')) throw error;
  }
  await db.batch(initialSql.map(query => db.prepare(query)));
}

function imageStorage(db) {
  return {
    async put(key, data, options) {
      const statements = [];
      const chunkSize = 256 * 1024;
      for (let start = 0; start < data.length; start += chunkSize) {
        statements.push(db.prepare('INSERT INTO image_chunks (image_id, part, mime, data) VALUES (?,?,?,?)')
          .bind(key, start / chunkSize, options.httpMetadata.contentType, data.slice(start,start+chunkSize).buffer));
      }
      await db.batch(statements);
    },
    async get(key) {
      const {results} = await db.prepare('SELECT mime, data FROM image_chunks WHERE image_id=? ORDER BY part').bind(key).all();
      if (!results.length) return null;
      const blob = new Blob(results.map(row => new Uint8Array(row.data)));
      return {body: blob, httpMetadata:{contentType:results[0].mime}};
    }
  };
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw',bytes.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(salt),iterations:100000},key,256));
}
function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let diff=0;
  for(let i=0;i<left.length;i++) diff |= left.charCodeAt(i)^right.charCodeAt(i);
  return diff===0;
}
function ownerConfigured(env) {
  return typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 20;
}
function getSessionToken(req) {
  return (req.headers.get('Cookie') || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
}
async function currentSession(req, env) {
  const token=getSessionToken(req);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row=await env.DB.prepare('SELECT account_id, email, role, owner_stamp FROM login_sessions WHERE token_hash=? AND expires>?')
    .bind(await digest(token),timestamp()).first();
  if (row?.role==='admin' && (!ownerConfigured(env) || !safeEqual(await digest('owner:'+env.ADMIN_PASSWORD), row.owner_stamp))) return null;
  return row;
}
function cookie(token,lifetime) {
  return cookieName+'='+token+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+lifetime;
}
function authResponse(data, status=200, sessionCookie) {
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
  if(sessionCookie) headers['Set-Cookie']=sessionCookie;
  return new Response(JSON.stringify(data),{status,headers});
}
async function handleLogin(req, env, action) {
  if (req.method!=='POST') return fail('طريقة غير مدعومة',405);
  if (req.headers.get('Origin')!==new URL(req.url).origin || !sameOrigin(req)) return fail('طلب غير مسموح',403);
  const db=env.DB;
  if(action==='logout') {
    const token=getSessionToken(req);
    if(token && /^[a-f0-9]{64}$/.test(token)) await db.prepare('DELETE FROM login_sessions WHERE token_hash=?').bind(await digest(token)).run();
    return authResponse({ok:true},200,cookie('',0));
  }
  if (!['owner','login','register'].includes(action)) return fail('غير موجود',404);
  if (Number(req.headers.get('Content-Length'))>4096) return fail('بيانات غير صالحة',413);
  const input=await body(req);
  if (!input || typeof input.password!=='string' || input.password.length>512) return fail('بيانات الدخول غير صالحة',400);
  if(action==='owner' && !ownerConfigured(env)) return fail('يلزم ضبط كلمة مرور المدير في إعدادات الاستضافة أولاً',503);
  const time=timestamp(), period=Math.floor(time/900);
  const limitKey=await digest((req.headers.get('CF-Connecting-IP') || 'local')+'|'+(action==='owner'?'owner':'account'));
  const throttle=await db.prepare('INSERT INTO login_limits (id, period, hits) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET hits=CASE WHEN period=excluded.period THEN hits+1 ELSE 1 END, period=excluded.period RETURNING hits')
    .bind(limitKey,period).first();
  if (throttle.hits>15) return fail('محاولات كثيرة. حاول بعد ربع ساعة.',429);
  let id,email,role='customer',stamp='';
  if(action==='owner') {
    const [expected,supplied]=await Promise.all([digest(env.ADMIN_PASSWORD),digest(input.password)]);
    if (!safeEqual(expected,supplied)) return fail('بيانات الدخول غير صحيحة',401);
    id='store_owner';email=internalOwner;role='admin';stamp=await digest('owner:'+env.ADMIN_PASSWORD);
  } else {
    email=String(input.email||'').trim().toLowerCase();
    if (email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email===internalOwner) return fail('بريد إلكتروني غير صالح',400);
    if(action==='register') {
      if(input.password.length<12) return fail('اختر كلمة مرور من 12 حرفاً على الأقل',422);
      id='cust_'+crypto.randomUUID();
      const salt=random(), hash=await passwordHash(input.password,salt);
      const result=await db.prepare('INSERT INTO login_accounts (id,email,salt,password_hash) VALUES (?,?,?,?) ON CONFLICT(email) DO NOTHING').bind(id,email,salt,hash).run();
      if (!result.meta.changes) return fail('تعذّر إنشاء الحساب بهذه البيانات. جرّب تسجيل الدخول.',409);
    } else {
      const row=await db.prepare('SELECT id,salt,password_hash FROM login_accounts WHERE email=?').bind(email).first();
      const supplied=await passwordHash(input.password,row?.salt||'00'.repeat(32));
      if(!row || !safeEqual(supplied,row.password_hash)) return fail('بيانات الدخول غير صحيحة',401);
      id=row.id;
    }
  }
  const token=random(), life=role==='admin'?43200:30*86400;
  await db.batch([
    db.prepare('DELETE FROM login_sessions WHERE expires<=?').bind(time),
    db.prepare('DELETE FROM login_limits WHERE period<?').bind(period-1),
    db.prepare('INSERT INTO login_sessions (token_hash,account_id,email,role,owner_stamp,expires) VALUES (?,?,?,?,?,?)')
      .bind(await digest(token),id,email,role,stamp,time+life)
  ]);
  return authResponse({ok:true},200,cookie(token,life));
}

export default {
  async fetch(request, env) {
    const path=new URL(request.url).pathname;
    if (!path.startsWith('/api/') && !path.startsWith('/uploads/')) return env.ASSETS.fetch(request);
    if (!env.DB) return fail('لم تُربط قاعدة بيانات المتجر بالاستضافة بعد',503);
    try {
      await initializeStore(env.DB);
      if(path.startsWith('/api/auth/')) return handleLogin(request,env,path.slice('/api/auth/'.length));
      const storeEnv={DB:env.DB,BUCKET:imageStorage(env.DB),ADMIN_EMAIL:internalOwner};
      if (path.startsWith('/uploads/')) return uploadedImage(request,storeEnv);
      const headers=new Headers(request.headers);
      headers.delete('oai-authenticated-user-id');
      headers.delete('oai-authenticated-user-email');
      const session=await currentSession(request,env);
      if(session) {
        headers.set('oai-authenticated-user-id',session.account_id);
        headers.set('oai-authenticated-user-email',session.role==='admin'?internalOwner:session.email);
      }
      return handleApi(new Request(request,{headers}),storeEnv);
    } catch {
      return fail('تعذر الاتصال ببيانات المتجر. حاول مرة أخرى.',503);
    }
  }
};
