# KEOVOTHY Digital Academy — វេបសាយស្តង់ដារ (Standard static site)

ឯកសារតែមួយ (`index (1).html`, 121KB) ត្រូវបានបំបែកជាកម្មវិធីវេបសាយស្តង់ដារ ងាយថែទាំ
ដោយ**រក្សាពណ៌ដើមទាំងអស់** (gold `#D4AF37` · gold-light `#F3E5AB` · gold-dark `#AA8C2C`
· background `#030303` · card `#080808`) និងរក្សា layout / font / animation / អត្ថបទ / តំណទាំងអស់។

## រចនាសម្ព័ន្ធ

```
index.html                  ← មាតិកា + SEO/Semantic markup (គ្មាន CSS/JS inline)
assets/
  css/styles.css            ← Tailwind utilities (បង្រួមតែក្នុងទំព័រនេះ) + site effects
  css/no-js.css             ← ទំព័របិទ JavaScript នៅបង្ហាញមាតិកាបាន
  img/                      ← logo · favicon · icons · og-cover (local មិន hotlink Drive)
  site.webmanifest          ← PWA manifest
js/main.js                  ← interaction ទាំងអស់ (module ជំនួស inline <script>)
src/                        ← ប្រភពសម្រាប់ build ឡើងវិញ
  head.html · site.css · tailwind.input.css · tailwind.config.js · _generated/
build/                      ← transform.py · assemble.py · build.sh
index.orig.html             ← ឯកសារដើម (ទុកយោង)
package.json                ← devDependencies: tailwindcss 3.4.17 (build tool តែប៉ុណ្ណោះ)
```

## អ្វីដែលបានកែ (និងមូលហេតុ)

| មុន | ឥឡូវ | ប្រយោជន៍ |
|---|---|---|
| `<script src="https://cdn.tailwindcss.com">` (បង្កើត CSS ក្នុង browser) | `assets/css/styles.css` (build + purge) | CSS ធំ ~350KB → 64KB · គ្មាន FOUC |
| `<style>` 818 បន្ទាត់ + inline `<script>` 428 បន្ទាត់ | 1 សន្លឹក CSS + 1 JS module (cache ដាច់ដោយឡែក) | កូដស្អាត ងាយកែ |
| Logo hotlink ពី `drive.google.com` | `assets/img/logo-512.jpg` + favicon/manifest icons | រហ័សទាន់ចិត្ត អាចទុកដាក់គ្រប់ hosting |
| `bg-[url('https://unsplash.com/…')]` (class វែង មាន `%26`) | `.course-photo--digital-marketing` / `--ai-copywriter` / `--crm` | class ខ្លី ងាយស្វែងយល់ |
| `onclick="window.scrollTo(...)"` | hook `data-scroll-next` ក្នុង `js/main.js` | គ្មាន inline JS (CSP-friendly) |
| គ្មានទិន្នន័យ SEO/social | canonical · robots · theme-color · Open Graph · Twitter card · JSON-LD (EducationalOrganization, WebSite, WebPage, BreadcrumbList, Course ×3) | ល្អសម្រាប់ Google និង preview លើ Telegram/Facebook |
| គ្មាន landmark/_skip link | `<main id="main-content">` · skip link · `<noscript>` notice · `width/height` លើរូប · `rel="noopener"` លើតំណ external ទាំងអស់ | accessibility + កាត់ layout shift |
| សំណល់ Blogger (`#navbar-iframe`) · animation `float` ដែលមិនប្រើ | លុបចេញ | ស្អាត |

មិនបានកែ៖ ពណ៌ · រចនាប័ទ្ម · អក្សរ · animation · តំណទៅ `assets/pages/*` និង `assets/apps/*` · វីដេអូ tutorial (តំណដើមដដែល)។

## Build ឡើងវិញក្រោយកែកូដ

```bash
npm install                                   # គ្រាន់តែម្តង (tailwind build)
./build/build.sh                              # → index.html + assets/css/styles.css
./build/build.sh https://your-domain.example   # កំណត់ origin សម្រាប់ canonical/OG/JSON-LD
```

ចំណាំ៖ ក្នុង `src/tailwind.input.css` តំណ `@import "./site.css"` ត្រូវស្ថិតនៅ**មុន** `@tailwind`
(លក្ខខណ្ឌរបស់ postcss-import) ហើយលំដាប់នេះរក្សា cascade ដូចដើម។

## ដំឡឹក និងរឿងត្រូវពិនិត្ម

1. អាប់ឡូត `index.html`, `assets/`, `js/` រួមជាមួយឯកសារដើមរបស់អ្នក (`assets/pages/*`, `assets/apps/*`, វីដេអូ + `assets/tutorial-01.png`) នៅ root តែមួយ។
   តំណទាំងនោះនៅដដែល ដូច្នេះ hosting ចាស់របស់អ្នកមិនបាត់បង់អ្វីទេ។
2. បើកមាញ់ console ឃើញ 404 នៅលើវីដេអូ មានន័យថាឯកសារ `.mp4` / `.png` នោះមិនទាន់មាននៅផ្លូវនេះ។
3. បន្ថែម `robots.txt` និង `sitemap.xml` តាម domain ពិត (canonical បច្ចុប្បន្ន = `https://keovothy93.github.io`)។

## ការពិនិត្ម

ប្រៀបធៀប screenshot (1366px និង 390px) ជាមួយឯកសារដើម៖ ទីតាំង/រចនាសម្ព័ន្ធដូចគ្នា
(pixel diff mean `0.04`) · interaction បានសាកល្បង៖ redirect modal (បើក/បោះបង់) ·
ជំហានវីដេអូ · mobile `<details>` menu · scroll-spy · desktop nav · **0 JS errors**។
