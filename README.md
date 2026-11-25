# ShuxBroh — Portfolio Website + Admin Panel

Five pages (Home, About, Services, Portfolio, Contact) and a password-protected Admin Panel at `/admin/`.
Content lives in **Supabase** (database + file storage) and the site is hosted on **Netlify**.

```
index.html  about.html  services.html  portfolio.html  contact.html
admin/                 ← Admin Panel (login, dashboard, all editors)
assets/css/style.css   ← website design system
assets/js/content.js   ← built-in default content (used until you publish from the Admin Panel)
assets/js/config.js    ← Supabase URL + public anon key (generated on Netlify)
assets/js/supa.js      ← small Supabase client (Auth, Database, Storage)
supabase/setup.sql     ← run once in Supabase: tables, security policies, storage bucket
scripts/build-config.js, netlify.toml  ← Netlify build step + headers
```

---

## 1. Create the Supabase project (about 5 minutes)

1. Go to **supabase.com** → sign in → **New project**. Pick a name (e.g. `shuxbroh`), a strong database password and the region closest to your visitors.
2. When it's ready, open **SQL Editor → New query**, paste the whole of `supabase/setup.sql`, and click **Run**.
   This creates:
   - `site_content` — all website text, images, links and settings (anyone can read, only admins can change)
   - `inquiries` — contact form messages (visitors can only send, only admins can read)
   - `admins` — the list of accounts allowed to edit
   - Storage bucket `media` (public images/videos up to 50 MB; only admins can upload or delete)
3. **Create your admin login:** Authentication → Users → **Add user → Create new user**. Enter your email and a strong password and tick **Auto Confirm User**.
4. **Make that user an admin:** back in the SQL Editor, run (with your email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict do nothing;
   ```
5. **Turn off public sign-ups:** Authentication → Sign In / Providers → **Allow new users to sign up → off**. (Even if someone signs up, they can't edit anything because they aren't in `admins` — this just keeps things tidy.)
6. **Copy your keys:** Project Settings → **API Keys** (or *Data API*). You need:
   - **Project URL** — e.g. `https://abcdxyz.supabase.co`
   - **anon public** key (or **Publishable** key, starts with `sb_publishable_`)

   ⚠️ Never use the **service_role** / **secret** key anywhere in this website. The build step refuses it.

## 2. Deploy on Netlify

1. Go to **app.netlify.com** → **Add new site → Deploy manually** and drop the unzipped project folder.
   (Or connect a GitHub repo containing the folder — then every push redeploys.)
2. Site configuration → **Environment variables → Add a variable**:
   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_ANON_KEY` | your anon / publishable key |
3. **Redeploy** so the build step writes `assets/js/config.js`:
   - Git-connected sites: Deploys → **Trigger deploy → Deploy site**.
   - Manual (drag-and-drop) deploys **don't run build commands**. For those, open `assets/js/config.js`, paste the two values, save, and drop the folder again. (These two values are public by design; security comes from the database policies.)
4. In Supabase → Authentication → **URL Configuration**, set **Site URL** to your Netlify address (e.g. `https://shuxbroh.netlify.app`) and add `https://shuxbroh.netlify.app/admin/` to **Redirect URLs** (needed for "Forgot password" emails).

## 3. Use the Admin Panel

- Open **`https://your-site.netlify.app/admin/`** and sign in with the user from step 1.3.
- The first time, click **Save & publish** once — this copies the built-in content into Supabase.
- Every change shows "You have unsaved changes". Click **Save & publish** (or Ctrl/⌘ + S) and the live website updates immediately.

| Section | What you can manage |
|---|---|
| Dashboard | Overview, counts, unread inquiries, quick links |
| Home Page | Hero text, profile photo, buttons, service labels, services preview, featured-work fallback cards, closing section, footer |
| About Page | Intro & photo, **Creator Stats** (Wallchain, Kaito, Smart Followers, X Followers, Impressions + your own), journey, what I do, skills, approach |
| Portfolio | Add / edit / delete / reorder projects, upload thumbnails & videos (or paste YouTube links), categories (rename updates all projects), links, **Featured on Home** |
| Services | Add / edit / delete / reorder, features, optional prices, hide/show each service |
| Contact | Email, X, Telegram, Instagram, YouTube + extra links, page text, inquiry form on/off and labels |
| Testimonials & Brands | Client quotes, names, companies, photos; brand names, logos, links, details |
| Media Library | Upload (drag & drop), preview, copy link, delete; shows which files are in use |
| Inquiries | Messages from the contact form: read/unread, reply by email, delete |
| Settings | Logo text/letter/image, page titles, description, menu links & button, colors (incl. your original palette preset), footer, change password, reset content |

Creator stats stay hidden on the About page until you enter at least one value. Use your real numbers (`1250`, `12.5K`, `3.2M`) — they count up when scrolled into view.

## 4. Security summary

- Admin sign-in uses **Supabase Auth**; no passwords are stored in the code.
- Only users in the `admins` table can change content, upload or delete media, or read inquiries — enforced by Row Level Security in the database, not just the UI.
- Visitors can only read public content and *send* an inquiry (with length checks).
- The admin area is marked `noindex`, can't be framed by other sites, and is excluded in `robots.txt`.
- Only the public anon/publishable key is used in the browser. The service-role key is never needed.

## Notes

- Without Supabase connected, the website still works using `assets/js/content.js`, and the contact form falls back to Netlify Forms / email.
- Supabase's free plan allows files up to 50 MB. For long videos, upload to YouTube and paste the link into the project's "Large preview" field.
- Inquiry email notifications aren't built in. If you want one, add a Supabase Database Webhook on `inquiries` (Database → Webhooks) pointing to an email service such as Zapier or Make.
