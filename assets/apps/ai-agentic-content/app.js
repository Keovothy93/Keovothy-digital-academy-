const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];

let activeMode = 'caption';
let latestOutputs = [];
let currentQuickMode = 'caption';
let activeTemplateFilter = 'all';

const modeNames = {
  caption:'Social Caption', hook:'Hook', ad:'Ad Copy', product:'Product Description', script:'Video Script', email:'Email Copy'
};
const modeIcons = { caption:'✦', hook:'↯', ad:'↗', product:'□', script:'▶', email:'✉' };
const goalMap = {
  awareness:'បង្កើនការស្គាល់ម៉ាក', engagement:'ជំរុញឱ្យមានការចូលរួម', conversion:'ជំរុញការទិញ', education:'ពន្យល់អត្ថប្រយោជន៍ឱ្យងាយយល់'
};
const voiceMap = {
  modern:['ទាន់សម័យ','ងាយស្រួលអាន'], premium:['ប្រណិត','មានរសជាតិ'], bold:['ខ្លាំង','ច្បាស់ និងលក់បាន'], warm:['ទន់ភ្លន់','ធម្មជាតិ និងកក់ក្តៅ']
};

const templates = [
  {id:'fb-caption',title:'Facebook Awareness Caption',category:'social',mode:'caption',icon:'f',desc:'Build an attention-grabbing social caption with a clear hook, benefit and CTA.',platform:'Facebook',goal:'awareness'},
  {id:'product-launch',title:'Product Launch Copy',category:'social',mode:'caption',icon:'✦',desc:'Announce a new product with a strong reason to care and a launch-ready CTA.',platform:'Facebook',goal:'awareness'},
  {id:'sales-ad',title:'Conversion Ad Copy',category:'ads',mode:'ad',icon:'↗',desc:'Create persuasive paid-ad copy focused on benefit, urgency and action.',platform:'Facebook',goal:'conversion'},
  {id:'ugc-script',title:'UGC Video Script',category:'video',mode:'script',icon:'▶',desc:'Short-form script with hook, product demo, benefit proof and CTA.',platform:'TikTok',goal:'engagement'},
  {id:'reels-hook',title:'Reels / TikTok Hooks',category:'video',mode:'hook',icon:'↯',desc:'Generate scroll-stopping opening lines for short-form video.',platform:'TikTok',goal:'engagement'},
  {id:'product-description',title:'Product Description',category:'web',mode:'product',icon:'□',desc:'Benefit-led ecommerce product description that is easy to scan.',platform:'Website',goal:'conversion'},
  {id:'promo-email',title:'Promotion Email',category:'email',mode:'email',icon:'✉',desc:'Subject-led promotional email with offer framing and a clear CTA.',platform:'Email',goal:'conversion'},
  {id:'educational',title:'Educational Caption',category:'social',mode:'caption',icon:'i',desc:'Explain product benefits clearly without sounding too sales-heavy.',platform:'Facebook',goal:'education'},
  {id:'retargeting',title:'Retargeting Ad',category:'ads',mode:'ad',icon:'↺',desc:'Bring interested shoppers back with a direct, focused reminder.',platform:'Facebook',goal:'conversion'}
];

const pageNames = {overview:'Overview',writer:'AI Writer',templates:'Templates',brand:'Brand Voice',projects:'Projects',analytics:'Analytics',settings:'Settings'};

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function showToast(message){
  $('toastText').textContent=message; $('toast').classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>$('toast').classList.remove('show'),1600);
}
function safeClipboard(text){
  if(navigator.clipboard?.writeText){return navigator.clipboard.writeText(text)}
  const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve();
}

function goToPage(page){
  if(!pageNames[page]) return;
  $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===page));
  $$('[data-page-link]').forEach(btn=>btn.classList.toggle('active',btn.dataset.pageLink===page && btn.classList.contains('nav-item')));
  $('pageCrumb').textContent=pageNames[page];
  history.replaceState(null,'',`#${page}`);
  window.scrollTo({top:0,behavior:'auto'});
  closeSidebar();
  if(page==='projects') renderProjects();
  if(page==='overview') renderOverviewActivity();
}
$$('[data-page-link]').forEach(el=>el.addEventListener('click',()=>goToPage(el.dataset.pageLink)));

function openSidebar(){ $('sidebar').classList.add('open'); $('sidebarBackdrop').classList.add('show'); }
function closeSidebar(){ $('sidebar').classList.remove('open'); $('sidebarBackdrop').classList.remove('show'); }
$('menuBtn').addEventListener('click',openSidebar); $('sidebarClose').addEventListener('click',closeSidebar); $('sidebarBackdrop').addEventListener('click',closeSidebar);

function loadPreferences(){
  const prefs=JSON.parse(localStorage.getItem('keovothy-settings')||'{}');
  if(prefs.dark){document.body.classList.add('dark');$('darkModeSwitch').classList.add('on');$('themeToggle').textContent='☀'}
  if(prefs.compact){document.body.classList.add('compact-sidebar');$('compactSwitch').classList.add('on')}
  if(prefs.language){$('settingLanguage').value=prefs.language;$('languageSelect').value=prefs.language}
  if(prefs.platform){$('settingPlatform').value=prefs.platform;$('platformSelect').value=prefs.platform}
  if(prefs.variations){$('settingVariations').value=prefs.variations;$('variationSelect').value=prefs.variations}
}
function toggleDark(force){
  const next=typeof force==='boolean'?force:!document.body.classList.contains('dark');
  document.body.classList.toggle('dark',next); $('darkModeSwitch').classList.toggle('on',next); $('themeToggle').textContent=next?'☀':'☾';
  const meta=document.querySelector('meta[name="theme-color"]'); if(meta)meta.content=next?'#161a22':'#ffffff';
}
$('themeToggle').addEventListener('click',()=>toggleDark());
$('darkModeSwitch').addEventListener('click',()=>toggleDark());
$('compactSwitch').addEventListener('click',()=>{document.body.classList.toggle('compact-sidebar');$('compactSwitch').classList.toggle('on')});
$('reviewSwitch').addEventListener('click',()=> $('reviewSwitch').classList.toggle('on'));
$('saveSettingsBtn').addEventListener('click',()=>{
  const prefs={dark:document.body.classList.contains('dark'),compact:document.body.classList.contains('compact-sidebar'),language:$('settingLanguage').value,platform:$('settingPlatform').value,variations:$('settingVariations').value,review:$('reviewSwitch').classList.contains('on')};
  localStorage.setItem('keovothy-settings',JSON.stringify(prefs)); $('languageSelect').value=prefs.language; $('platformSelect').value=prefs.platform; $('variationSelect').value=prefs.variations; showToast('Settings saved');
});

function renderPopularTemplates(){
  $('popularTemplates').innerHTML=templates.slice(0,3).map(t=>`<button class="template-mini" data-template-id="${t.id}"><span class="template-mini-icon">${t.icon}</span><strong>${t.title}</strong><small>${t.desc}</small></button>`).join('');
  $$('[data-template-id]').forEach(btn=>btn.addEventListener('click',()=>useTemplate(btn.dataset.templateId)));
}
function renderTemplateGrid(){
  const q=($('templateSearch').value||'').trim().toLowerCase();
  const filtered=templates.filter(t=>(activeTemplateFilter==='all'||t.category===activeTemplateFilter)&&(!q||`${t.title} ${t.desc} ${t.category}`.toLowerCase().includes(q)));
  $('templateGrid').innerHTML=filtered.length?filtered.map(t=>`<article class="template-card"><div class="template-card-head"><span class="template-icon">${t.icon}</span><span class="template-category">${t.category}</span></div><h3>${t.title}</h3><p>${t.desc}</p><div class="template-card-footer"><span>${t.platform}</span><button class="use-template" data-use-template="${t.id}">Use template →</button></div></article>`).join(''):`<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">⌕</span><h3>No templates found</h3><p>Try another search or category.</p></div>`;
  $$('[data-use-template]').forEach(btn=>btn.addEventListener('click',()=>useTemplate(btn.dataset.useTemplate)));
}
function useTemplate(id){
  const t=templates.find(x=>x.id===id); if(!t)return;
  activeMode=t.mode; $$('.mode-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.mode===activeMode));
  $('platformSelect').value=t.platform; $('goalSelect').value=t.goal; goToPage('writer'); showToast(`${t.title} loaded`);
}
$('templateSearch').addEventListener('input',renderTemplateGrid);
$$('#templateFilters .chip').forEach(btn=>btn.addEventListener('click',()=>{$$('#templateFilters .chip').forEach(x=>x.classList.remove('active'));btn.classList.add('active');activeTemplateFilter=btn.dataset.filter;renderTemplateGrid()}));

$$('.mode-tab').forEach(tab=>tab.addEventListener('click',()=>{$$('.mode-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');activeMode=tab.dataset.mode}));
$('advancedToggle').addEventListener('click',()=>{$('advancedFields').classList.toggle('open');$('advancedToggle').querySelector('span').textContent=$('advancedFields').classList.contains('open')?'⌃':'⌄'});

function getBrief(){
  return {product:$('productInput').value.trim()||'ផលិតផលរបស់អ្នក',benefit:$('benefitInput').value.trim()||'ផ្តល់អត្ថប្រយោជន៍ច្បាស់សម្រាប់អ្នកប្រើប្រាស់',audience:$('audienceInput').value.trim()||'អតិថិជនគោលដៅ',goal:$('goalSelect').value,voice:$('voiceSelect').value,platform:$('platformSelect').value,cta:$('ctaInput').value.trim()||'ស្វែងយល់បន្ថែមថ្ងៃនេះ',language:$('languageSelect').value,mode:activeMode,length:$('lengthSelect').value,variations:Number($('variationSelect').value)};
}
function hashtagize(product){const clean=product.replace(/[^a-zA-Z0-9\u1780-\u17FF ]/g,' ').trim();const compact=clean.split(/\s+/).slice(0,3).join('');return `#${compact||'Keovothy'} #BeautyCambodia #KeovothyCopy`}
function kmVersions(b){
  const {product,benefit,cta}=b, goal=goalMap[b.goal], tags=hashtagize(product);
  if(b.mode==='hook')return [`✨ ${product} — មួយជំហានតូច សម្រាប់អារម្មណ៍ល្អរាល់ថ្ងៃ!`,`តើអ្នកកំពុងស្វែងរក ${benefit} មែនទេ? ${product} អាចជាជម្រើសដែលអ្នកកំពុងត្រូវការ។`,`កុំឱ្យ routine ប្រចាំថ្ងៃធម្មតាពេក—បន្ថែមអារម្មណ៍ថ្មីជាមួយ ${product}។`,`ចង់ឱ្យការថែទាំប្រចាំថ្ងៃមានអារម្មណ៍ខុសគ្នា? ចាប់ផ្តើមជាមួយ ${product} ✨`];
  if(b.mode==='ad')return [`ចង់បានផលិតផលដែលឆ្លើយតបទាំងអារម្មណ៍ និងការប្រើប្រាស់ប្រចាំថ្ងៃ?\n\n${product} ផ្តោតលើ ${benefit} ដើម្បីឱ្យ routine របស់អ្នកកាន់តែងាយស្រួល។ សាកសមសម្រាប់ ${b.audience}។\n\n👉 ${cta}\n${tags}`,`${product} មិនមែនគ្រាន់តែជាផលិតផលមួយទេ—វាជាជម្រើសសម្រាប់អ្នកដែលចង់បានភាពងាយស្រួល និងបទពិសោធន៍ប្រើប្រាស់កាន់តែល្អ។\n\n✓ ${benefit}\n✓ សមស្របសម្រាប់ ${b.audience}\n✓ គោលដៅ៖ ${goal}\n\n${cta}`,`ឃើញការផ្សព្វផ្សាយច្រើនហើយ តែមិនដឹងជ្រើសអ្វី? ចាប់ផ្តើមពី Key Benefit ដែលច្បាស់។\n\n${product}: ${benefit}។\n\n${cta} ✨`,`ពេលជ្រើសផលិតផលសម្រាប់ routine ប្រចាំថ្ងៃ ចំណុចសំខាន់គឺត្រូវដឹងថាវាផ្តល់អ្វីឱ្យអ្នក។ ${product} ផ្តោតលើ ${benefit}។\n\n👉 ${cta}`];
  if(b.mode==='product')return [`${product} ត្រូវបានរៀបចំសម្រាប់ ${b.audience} ដោយផ្តោតលើ ${benefit}។ បទពិសោធន៍ប្រើប្រាស់ត្រូវបានបង្ហាញក្នុងស្ទាយ៍ ${voiceMap[b.voice][0]} ដើម្បីឱ្យអតិថិជនងាយយល់ពីតម្លៃសំខាន់របស់ផលិតផល។\n\n${cta}`,`អត្ថប្រយោជន៍សំខាន់៖\n• ${benefit}\n• សាកសមសម្រាប់ ${b.audience}\n• ងាយបញ្ចូលក្នុង routine ប្រចាំថ្ងៃ\n\n${product} — ជាជម្រើសមួយសម្រាប់អ្នកដែលចង់បានការថែទាំសាមញ្ញ ប៉ុន្តែមានគោលបំណងច្បាស់។`,`${product} បង្កើតឡើងដើម្បីធ្វើឱ្យការថែទាំប្រចាំថ្ងៃកាន់តែងាយស្រួល។ ចំណុចដែលគួរឱ្យចាប់អារម្មណ៍គឺ ${benefit}។ សម្រាប់ ${b.audience} ដែលចង់បានស្ទាយ៍ ${voiceMap[b.voice][1]} នេះជាជម្រើសដែលគួរពិចារណា។`,`សម្រាប់អ្នកដែលចង់ឱ្យ routine មើលទៅសាមញ្ញ និងមានគោលដៅច្បាស់ ${product} ផ្តោតលើ ${benefit}។ ${cta}`];
  if(b.mode==='script')return [`Scene 1 — Hook\n“ថ្ងៃនេះចង់ណែនាំ ${product} សម្រាប់អ្នកដែលចង់បាន ${benefit}।”\n\nScene 2 — Product close-up\nបង្ហាញ packaging និង usage ខ្លីៗ។\nVO: “ចំណុចដែលគួរឱ្យចាប់អារម្មណ៍គឺ ${benefit}।”\n\nScene 3 — Benefit\nបង្ហាញការប្រើប្រាស់ប្រចាំថ្ងៃ។\nVO: “សាកសមសម្រាប់ ${b.audience} ហើយងាយប្រើក្នុង routine ប្រចាំថ្ងៃ।”\n\nScene 4 — CTA\nVO: “${cta}”`,`0–3s: “មានពេលតិច តែចង់ថែខ្លួនឱ្យបានល្អ?”\n4–8s: បង្ហាញ ${product} ជិតកាមេរ៉ា។\n9–15s: “ផលិតផលនេះផ្តោតលើ ${benefit}।”\n16–20s: Final packshot + Text on screen “${cta}”`,`Hook: “មួយផលិតផល អាចធ្វើឱ្យ routine របស់អ្នកមានអារម្មណ៍ខុសគ្នា!”\nBody: បង្ហាញ ${product} និងពន្យល់ថា ${benefit}។\nProof angle: បង្ហាញ usage ឱ្យឃើញច្បាស់ និងកុំធ្វើ claim លើសពី brief។\nCTA: “${cta}”`,`Scene 1: Problem / desire\nScene 2: Reveal ${product}\nScene 3: Explain ${benefit}\nScene 4: Show everyday use for ${b.audience}\nScene 5: Hero product shot\nVO CTA: “${cta}”`];
  if(b.mode==='email')return [`Subject: Routine ថ្មីដែលងាយស្រួលជាងមុន ✨\n\nសួស្តី,\n\nបើអ្នកកំពុងស្វែងរក ${benefit} សាកមើល ${product}។ វាត្រូវបានណែនាំសម្រាប់ ${b.audience} និងបង្កើត message ឱ្យងាយយល់ ដោយមិនធ្វើឱ្យការថែទាំប្រចាំថ្ងៃស្មុគស្មាញ។\n\n${cta}\n\n— Keovothy Copy`,`Subject: មកស្គាល់ ${product}\n\nផលិតផលមួយដែលផ្តោតលើចំណុចសំខាន់៖ ${benefit}។\n\nសម្រាប់ ${b.audience} នេះជាជម្រើសដែលអាចបញ្ចូលបានងាយក្នុង routine ប្រចាំថ្ងៃ។\n\n👉 ${cta}`,`Subject: A simple upgrade for your routine\n\n${product} ផ្តោតលើ ${benefit} ដើម្បីឱ្យអ្នកយល់ច្បាស់ថាផលិតផលនេះអាចសមនឹង routine របស់អ្នកយ៉ាងដូចម្តេច។\n\n${cta}`,`Subject: ${product} — ចំណុចដែលគួរឱ្យចាប់អារម្មណ៍\n\n• ${benefit}\n• សាកសមសម្រាប់ ${b.audience}\n• Message បែប ${voiceMap[b.voice][0]}\n\n${cta}`];
  return [`✨ ចាប់ផ្តើម routine ប្រចាំថ្ងៃជាមួយ ${product}\n\n${benefit} ដើម្បីឱ្យការថែទាំរបស់អ្នកមានអារម្មណ៍ងាយស្រួល និងរីករាយជាងមុន។ សាកសមសម្រាប់ ${b.audience} និង content style ${voiceMap[b.voice][0]}។\n\n👉 ${cta}\n${tags}`,`មិនចាំបាច់ធ្វើឱ្យ routine ស្មុគស្មាញទេ 💜\n\n${product} ផ្តោតលើចំណុចសំខាន់មួយ៖ ${benefit}។ បង្កើតសារឱ្យអតិថិជនយល់លឿន ថាហេតុអ្វីផលិតផលនេះសាកសមសម្រាប់ពួកគេ។\n\n${cta}\n${tags}`,`ស្រស់ស្រាយ. ងាយប្រើ. ច្បាស់លាស់។\n\nជាមួយ ${product} អ្នកទទួលបាន message សាមញ្ញតែមានទម្ងន់៖ ${benefit}។ សាកសមសម្រាប់ ${b.audience} និងគោលដៅ ${goal}។\n\n✨ ${cta}`,`${product} សម្រាប់ថ្ងៃដែលអ្នកចង់បាន routine ងាយៗ តែមាន Key Benefit ច្បាស់ ✨\n\n${benefit}។\n\nសាកសមសម្រាប់ ${b.audience}។\n👉 ${cta}`];
}
function enVersions(b){
  const {product,benefit,cta}=b;
  if(b.mode==='hook')return [`${product}: a simple upgrade to your everyday routine.`,`Looking for ${benefit.toLowerCase()}? Start with ${product}.`,`Make everyday care feel a little more intentional with ${product}.`,`A clearer routine starts with one clear benefit — meet ${product}.`];
  if(b.mode==='script')return [`Scene 1 — Hook\n“Here’s ${product} for anyone looking for ${benefit}.”\n\nScene 2 — Product close-up\nShow the pack and usage.\nVO: “The key reason to notice it: ${benefit}.”\n\nScene 3 — Everyday use\nVO: “Designed for ${b.audience} and easy to fit into a daily routine.”\n\nScene 4 — CTA\n“${cta}”`,`0–3s: “Short on time but still want a better routine?”\n4–8s: Hero shot of ${product}.\n9–15s: “It focuses on ${benefit}.”\n16–20s: Final packshot + CTA: “${cta}”`,`Hook: “One product can make your routine feel different.”\nBody: Introduce ${product} and explain ${benefit}.\nProof angle: Show real usage without adding claims beyond the brief.\nCTA: “${cta}”`,`Scene 1: Start with the audience need.\nScene 2: Reveal ${product}.\nScene 3: Explain ${benefit}.\nScene 4: Demonstrate everyday use.\nScene 5: Close with “${cta}”.`];
  if(b.mode==='email')return [`Subject: A simpler way to upgrade your routine\n\nMeet ${product}, created for people looking for ${benefit}. It is positioned for ${b.audience} with a clear, easy-to-understand message.\n\n${cta}`,`Subject: Meet ${product}\n\nOne clear reason to notice it: ${benefit}. If that matters to your routine, ${product} is worth a closer look.\n\n${cta}`,`Subject: Your routine, made more intentional\n\n${product} keeps the message simple — ${benefit}. Built for ${b.audience} and written to be easy to understand.\n\n${cta}`,`Subject: Why ${product} stands out\n\n• ${benefit}\n• Designed for ${b.audience}\n• Clear, benefit-first positioning\n\n${cta}`];
  return [`Meet ${product} — created for people who want ${benefit}. Clear, easy to understand, and designed for ${b.audience}.\n\n${cta}`,`${product} keeps the message simple: ${benefit}. A strong fit for ${b.audience} and content built for ${b.platform}.\n\n${cta}`,`A better routine starts with a clearer benefit. ${product} focuses on ${benefit}, with a ${voiceMap[b.voice][0]} tone that keeps the message easy to remember.\n\n${cta}`,`${product} puts one benefit first: ${benefit}. For ${b.audience}, that makes the choice easier to understand.\n\n${cta}`];
}
function createOutputs(b){
  const km=kmVersions(b),en=enVersions(b); let arr=b.language==='en'?en:b.language==='both'?km.map((x,i)=>`${x}\n\n— English —\n${en[i]}`):km; return arr.slice(0,b.variations||3);
}
async function animateAgents(){
  const names=['strategist','writer','reviewer','optimizer'];
  $$('.agent-row').forEach(row=>{row.classList.remove('running','done');row.querySelector('.agent-state').textContent='Waiting'});
  for(const name of names){const row=document.querySelector(`[data-agent="${name}"]`);row.classList.add('running');row.querySelector('.agent-state').textContent='Working';await new Promise(r=>setTimeout(r,280));row.classList.remove('running');row.classList.add('done');row.querySelector('.agent-state').textContent='Done'}
}
function setScore(id,value){$(id+'Score').textContent=value+'%';$(id+'Bar').style.width=value+'%'}
function renderOutputs(outputs){
  $('outputs').innerHTML=outputs.map((text,i)=>`<article class="output-card"><div class="output-label"><span>Variation ${i+1}</span><div class="output-actions-mini"><button class="save-output-btn" data-save-output="${i}">♡ Save</button><button class="copy-btn" data-copy-output="${i}">Copy</button></div></div><div class="output-text">${escapeHtml(text)}</div><div class="output-footer"><span>${modeNames[activeMode]}</span><span>${text.length} chars</span></div></article>`).join('');
  $$('[data-copy-output]').forEach(btn=>btn.addEventListener('click',async()=>{await safeClipboard(latestOutputs[Number(btn.dataset.copyOutput)]);showToast('Variation copied')}));
  $$('[data-save-output]').forEach(btn=>btn.addEventListener('click',()=>saveProject(Number(btn.dataset.saveOutput))));
}
async function runGeneration(){
  const b=getBrief(); if(!$('productInput').value.trim()||!$('benefitInput').value.trim()){showToast('Add product and key benefit first');return}
  $('runBtn').disabled=true;$('runBtn').querySelectorAll('span')[1].textContent='Keovothy is working…';$('agentInsight').querySelector('p').textContent=`Planning ${modeNames[b.mode]} for ${b.platform}, optimized for ${goalMap[b.goal]}.`;
  await animateAgents();latestOutputs=createOutputs(b);renderOutputs(latestOutputs);setScore('clarity',94);setScore('brand',91);setScore('cta',b.cta?92:74);setScore('platform',95);$('agentInsight').querySelector('p').textContent=`Created ${latestOutputs.length} ${modeNames[b.mode].toLowerCase()} directions using a ${voiceMap[b.voice][0]} tone for ${b.platform}.`;$('runBtn').disabled=false;$('runBtn').querySelectorAll('span')[1].textContent='Generate with Keovothy';incrementGeneration();
}
$('runBtn').addEventListener('click',runGeneration);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&document.querySelector('[data-page="writer"]').classList.contains('active'))runGeneration()});
$('loadExampleBtn').addEventListener('click',()=>{$('productInput').value='Cellina Perfume Body Wash 900g';$('benefitInput').value='សម្អាតស្បែកទន់ភ្លន់ ក្លិនក្រអូប និងជួយរក្សាសំណើមស្បែក';$('audienceInput').value='នារី និងបុរសអាយុ 18–35 ឆ្នាំ';$('ctaInput').value='សាកល្បងក្លិនដែលអ្នកចូលចិត្តថ្ងៃនេះ';showToast('Example brief loaded')});
$('copyAllBtn').addEventListener('click',async()=>{if(!latestOutputs.length)return showToast('Generate copy first');await safeClipboard(latestOutputs.map((v,i)=>`Variation ${i+1}\n${v}`).join('\n\n----------------\n\n'));showToast('All variations copied')});
$('exportBtn').addEventListener('click',()=>{if(!latestOutputs.length)return showToast('Generate copy first');const b=getBrief(),content=`Keovothy — ${modeNames[b.mode]}\nProduct: ${b.product}\nPlatform: ${b.platform}\n\n`+latestOutputs.map((v,i)=>`VARIATION ${i+1}\n${v}`).join('\n\n----------------\n\n');const blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`keovothy-${b.mode}-${Date.now()}.txt`;a.click();URL.revokeObjectURL(url);showToast('Exported as .txt')});

function getProjects(){return JSON.parse(localStorage.getItem('keovothy-projects')||'[]')}
function setProjects(list){localStorage.setItem('keovothy-projects',JSON.stringify(list.slice(0,50)));updateStats()}
function saveProject(index=0){
  if(!latestOutputs.length)return showToast('Generate copy first');const b=getBrief(),list=getProjects();list.unshift({id:Date.now(),product:b.product,mode:b.mode,platform:b.platform,output:latestOutputs[index]||latestOutputs[0],updated:new Date().toISOString()});setProjects(list);renderProjects();renderOverviewActivity();showToast('Project saved');
}
$('saveBtn').addEventListener('click',()=>saveProject(0));
function openProject(id){
  const p=getProjects().find(x=>x.id===Number(id));if(!p)return;activeMode=p.mode;$$('.mode-tab').forEach(t=>t.classList.toggle('active',t.dataset.mode===activeMode));$('productInput').value=p.product;$('platformSelect').value=p.platform||'Facebook';latestOutputs=[p.output];renderOutputs(latestOutputs);setScore('clarity',94);setScore('brand',91);setScore('cta',92);setScore('platform',95);goToPage('writer');showToast('Project opened');
}
function deleteProject(id){setProjects(getProjects().filter(x=>x.id!==Number(id)));renderProjects();renderOverviewActivity();showToast('Project deleted')}
function renderProjects(){
  const q=($('projectSearch').value||'').toLowerCase(),f=$('projectFilter').value;const list=getProjects().filter(p=>(f==='all'||p.mode===f)&&(!q||`${p.product} ${p.output}`.toLowerCase().includes(q)));const tbody=$('projectsTableBody');tbody.innerHTML=list.map(p=>`<tr><td><div class="project-title-cell"><span class="project-type-icon">${modeIcons[p.mode]||'✦'}</span><div><strong>${escapeHtml(p.product)}</strong><small>${escapeHtml(p.output)}</small></div></div></td><td><span class="type-pill">${modeNames[p.mode]||p.mode}</span></td><td>${escapeHtml(p.platform||'—')}</td><td>${formatDate(p.updated)}</td><td><div class="row-actions"><button class="row-btn" data-open-project="${p.id}">Open</button><button class="row-btn danger" data-delete-project="${p.id}">Delete</button></div></td></tr>`).join('');$('projectsEmpty').style.display=list.length?'none':'block';
  $$('[data-open-project]').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.openProject)));$$('[data-delete-project]').forEach(b=>b.addEventListener('click',()=>deleteProject(b.dataset.deleteProject)));
}
function formatDate(iso){if(!iso)return'—';const d=new Date(iso),diff=Date.now()-d.getTime();if(diff<60000)return'Just now';if(diff<3600000)return`${Math.floor(diff/60000)}m ago`;if(diff<86400000)return`${Math.floor(diff/3600000)}h ago`;return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
$('projectSearch').addEventListener('input',renderProjects);$('projectFilter').addEventListener('change',renderProjects);

function renderOverviewActivity(){
  const list=getProjects().slice(0,4);$('overviewActivity').innerHTML=list.length?list.map(p=>`<div class="activity-item"><span class="activity-icon">${modeIcons[p.mode]||'✦'}</span><div class="activity-copy"><strong>${escapeHtml(p.product)}</strong><small>${modeNames[p.mode]} · ${escapeHtml(p.platform||'—')}</small></div><span class="activity-time">${formatDate(p.updated)}</span></div>`).join(''):`<div class="activity-empty">Save a generated copy to see activity here.</div>`;
}
function updateStats(){ $('statProjects').textContent=getProjects().length; const gen=Number(localStorage.getItem('keovothy-generations')||'128'); $('statGenerated').textContent=gen; }
function incrementGeneration(){localStorage.setItem('keovothy-generations',String(Number(localStorage.getItem('keovothy-generations')||'128')+1));updateStats()}
function newProject(){
  $('productInput').value='';$('benefitInput').value='';$('audienceInput').value='';$('ctaInput').value='';latestOutputs=[];$('outputs').innerHTML='<div class="empty-state output-empty"><span class="empty-icon">✦</span><h3>New copy ready</h3><p>Add your creative brief and generate when ready.</p></div>';['clarity','brand','cta','platform'].forEach(id=>{setScore(id,0);$(id+'Score').textContent='—'});goToPage('writer');setTimeout(()=>$('productInput').focus(),100);showToast('New copy created')
}
$('newProjectBtn').addEventListener('click',newProject);$('projectsNewBtn').addEventListener('click',newProject);

$$('[data-quick-mode]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-quick-mode]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');currentQuickMode=btn.dataset.quickMode}));
$('quickGenerateBtn').addEventListener('click',()=>{
  const prompt=$('quickPrompt').value.trim();activeMode=currentQuickMode;$$('.mode-tab').forEach(t=>t.classList.toggle('active',t.dataset.mode===activeMode));if(prompt){$('productInput').value=prompt;$('benefitInput').value='បង្កើតសារដែលច្បាស់ ងាយយល់ និងសមស្របសម្រាប់ការផ្សព្វផ្សាយ';$('audienceInput').value='អតិថិជនគោលដៅរបស់ម៉ាក'}goToPage('writer');showToast('Brief prepared from your prompt')
});

function updateBrandPreview(){
  $('brandPreviewName').textContent=$('brandNameInput').value||'Your brand';$('brandPreviewDesc').textContent=$('brandDescInput').value||'Add a description to preview your brand voice.';const traits=$$('#traitSelect .trait.active').map(x=>x.textContent);$('previewTraits').innerHTML=traits.map(x=>`<span>${escapeHtml(x)}</span>`).join('')||'<span>Neutral</span>';
}
['brandNameInput','brandDescInput'].forEach(id=>$(id).addEventListener('input',updateBrandPreview));$$('#traitSelect .trait').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');updateBrandPreview()}));
$('saveBrandBtn').addEventListener('click',()=>{const brand={name:$('brandNameInput').value,desc:$('brandDescInput').value,audience:$('brandAudienceInput').value,language:$('brandLanguageInput').value,traits:$$('#traitSelect .trait.active').map(x=>x.textContent),use:$('brandUseInput').value,avoid:$('brandAvoidInput').value};localStorage.setItem('keovothy-brand',JSON.stringify(brand));showToast('Brand voice saved')});
function loadBrand(){const b=JSON.parse(localStorage.getItem('keovothy-brand')||'null');if(!b)return;$('brandNameInput').value=b.name||'';$('brandDescInput').value=b.desc||'';$('brandAudienceInput').value=b.audience||'';$('brandLanguageInput').value=b.language||'Khmer';$('brandUseInput').value=b.use||'';$('brandAvoidInput').value=b.avoid||'';$$('#traitSelect .trait').forEach(x=>x.classList.toggle('active',(b.traits||[]).includes(x.textContent)));updateBrandPreview()}

const searchItems=[
  ['Overview','Dashboard and recent activity','overview'],['AI Writer','Create new copy','writer'],['Templates','Browse writing frameworks','templates'],['Brand Voice','Manage tone and brand rules','brand'],['Projects','Open saved copy','projects'],['Analytics','View workspace performance','analytics'],['Settings','Change app preferences','settings']
];
function renderSearch(q=''){const s=q.toLowerCase();$('searchResults').innerHTML=searchItems.filter(x=>!s||`${x[0]} ${x[1]}`.toLowerCase().includes(s)).map(x=>`<button class="search-result" data-search-page="${x[2]}"><span>${x[0]}<small> · ${x[1]}</small></span><small>Open →</small></button>`).join('');$$('[data-search-page]').forEach(b=>b.addEventListener('click',()=>{goToPage(b.dataset.searchPage);closeSearch()}))}
function openSearch(){$('searchOverlay').classList.add('open');$('searchOverlay').setAttribute('aria-hidden','false');renderSearch();setTimeout(()=>$('globalSearchInput').focus(),50)}
function closeSearch(){$('searchOverlay').classList.remove('open');$('searchOverlay').setAttribute('aria-hidden','true');$('globalSearchInput').value=''}
$('searchBtn').addEventListener('click',openSearch);$('globalSearchInput').addEventListener('input',e=>renderSearch(e.target.value));$('searchOverlay').addEventListener('click',e=>{if(e.target===$('searchOverlay'))closeSearch()});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')closeSearch()});

function init(){
  loadPreferences();loadBrand();renderPopularTemplates();renderTemplateGrid();renderProjects();renderOverviewActivity();updateStats();updateBrandPreview();
  const hash=location.hash.replace('#','');goToPage(pageNames[hash]?hash:'overview');
}
init();
