/* ---------------------------------------------------------------------------
   Stage 01 — the subject's own public surface.

   Map the site, choose the pages that describe *operations* rather than
   marketing, scrape those, and pull deterministic signals out of the text.

   Page selection happens from the map response, before any scraping. The live
   probe on hpsrx.com is why: 31 links came back, only 9 carried a title or
   description, and three were sitemap XML. Selection therefore scores URL
   paths first and treats title and description as a bonus. Code that leaned on
   titles would have selected almost nothing on a Wix site and looked fine
   doing it.

   The highest-yield pages, per the README, are the ones that describe how the
   work actually gets done:

     help centre / support   a published description of their manual workflows
     careers                 what they're building and can't hire for
     integrations / API      their systems of record
     pricing / ordering      where the human steps are

   Everything extracted here is a quotation or a count with a URL behind it.
   Nothing is inferred, because inference is stage 05's problem and numbers are
   nobody's.
--------------------------------------------------------------------------- */

import type { CacheOptions } from '../lib/cache.ts';
import type { Ledger } from '../lib/budget.ts';
import { map, scrape, type FirecrawlLink } from '../lib/clients/firecrawl.ts';
import { registrableDomain } from '../lib/domain.ts';
import { robotsFor } from '../lib/http.ts';
import { mapWithConcurrency, PAGE_CONCURRENCY } from '../lib/concurrency.ts';

export type PageCategory =
  | 'home'
  | 'help'
  | 'careers'
  | 'roster'
  | 'integrations'
  | 'pricing'
  | 'company'
  | 'product'
  | 'other';

/**
 * Path keywords per category, with the weight that decides scrape order.
 * Ops-describing categories outrank marketing ones — that ordering is the
 * whole selection strategy, and it is deliberately visible in one table.
 */
const CATEGORY_RULES: { category: PageCategory; weight: number; keywords: string[]; cap: number }[] = [
  {
    category: 'help',
    weight: 10,
    cap: 4,
    keywords: ['help', 'support', 'docs', 'documentation', 'faq', 'knowledge', 'kb', 'guide', 'guides', 'how-it-works', 'how-to', 'training', 'resources', 'tutorial'],
  },
  {
    category: 'careers',
    weight: 9,
    cap: 3,
    /* `team` was in this list and cost us a whole report. adventurelabworks.com
       (2026-09-05) publishes /team, a roster of six named territory managers
       with first-person biographies; it matched here, its card subtitles were
       harvested as `roleLines`, and obs-hiring told the reader "your careers
       page lists these roles" about their own staff. Every "why now" in that
       run rested on hiring strain that did not exist — the owner had in fact
       said he could not afford to hire. A roster is not a job board: it gets
       its own category below, and `looksLikeRoster` catches the pages whose
       path lies. */
    keywords: ['career', 'careers', 'jobs', 'job', 'join-us', 'join', 'work-with-us', 'hiring', 'internship', 'internships', 'employment', 'openings', 'positions'],
  },
  {
    /* Who works here and what they cover. Worth reading — on a territory
       business the roster *is* the org chart, and it names the patches — but it
       says nothing about what a company is hiring for. Ranked below careers so
       a site with both still spends its careers slots first, and above company
       because named people beat an About page for understanding the shape of
       the operation. */
    category: 'roster',
    weight: 6,
    cap: 2,
    keywords: ['team', 'our-team', 'teams', 'meet-the-team', 'people', 'staff', 'leadership', 'reps'],
  },
  {
    category: 'integrations',
    weight: 8,
    cap: 3,
    keywords: ['integration', 'integrations', 'api', 'developers', 'developer', 'connect', 'connections', 'ecosystem', 'partners', 'partner', 'technology', 'platform', 'interoperability', 'edi'],
  },
  {
    category: 'pricing',
    weight: 7,
    cap: 4,
    keywords: ['pricing', 'price', 'plans', 'ordering', 'order', 'orders', 'quote', 'payment', 'payments', 'billing', 'shipping', 'returns', 'terms', 'policy', 'policies', 'checkout-info'],
  },
  {
    category: 'company',
    weight: 5,
    cap: 3,
    keywords: ['about', 'about-us', 'company', 'company-profile', 'who-we-are', 'our-story', 'mission', 'history', 'contact', 'locations', 'compliance', 'quality', 'certifications'],
  },
  {
    category: 'product',
    weight: 3,
    cap: 3,
    /* `brands` and `lines`: a distributor or a rep agency sells other people's
       products, and their catalogue page is called Our Brands. */
    keywords: ['products', 'services', 'solutions', 'capabilities', 'what-we-do', 'offerings', 'catalog', 'industries', 'brands', 'lines'],
  },
];

/**
 * How many pages the navigation may contribute on its own, having matched none
 * of the category rules. Enough to cover a small site's own idea of what
 * matters, not enough for a link farm to eat the page budget.
 */
const NAV_OTHER_CAP = 4;

/** Words that make a line a candidate job title, wherever they appear in it. */
const TITLE_WORD =
  /\b(manager|director|specialist|coordinator|representative|analyst|engineer|developer|nurse|pharmacist|technician|associate|assistant|clerk|buyer|planner|supervisor|intern|internship|sales|account executive|principal)\b/i;

/** A link in the homepage's own navigation, with the words they gave it. */
export interface NavHint {
  url: string;
  label: string;
}

/** URLs that are never worth a credit. */
const SKIP_PATTERNS = [
  /\.(xml|json|txt|pdf|jpe?g|png|gif|svg|webp|ico|css|js|zip|csv|xlsx?|docx?)($|\?)/i,
  /sitemap/i,
  /\/(cart|checkout|login|log-in|signin|sign-in|signup|sign-up|account|my-account|wishlist)(\/|$)/i,
  /\/(thank-you|thanks|404|error|search)(\/|$|-)/i,
  /(privacy|cookie|gdpr|accessibility|sitemap|disclaimer)/i,
  /\?/,
];

export interface SelectedPage {
  url: string;
  category: PageCategory;
  weight: number;
  /** Why this page was picked — kept so a thin run is explainable. */
  matched: string;
  titleFromMap?: string;
  descriptionFromMap?: string;
}

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return (u.pathname + (u.hash ? '' : '')).toLowerCase();
  } catch {
    return '';
  }
}

function isHome(url: string, domain: string): boolean {
  const path = pathOf(url);
  return (path === '' || path === '/') && registrableDomain(url) === domain;
}

/** Path segments, plus hyphen-split words, so `careers-and-internships` hits. */
function tokensOf(url: string): string[] {
  const path = pathOf(url);
  const segments = path.split('/').filter(Boolean);
  const words = segments.flatMap((s) => s.split(/[-_.]/)).filter(Boolean);
  return [...new Set([...segments, ...words])];
}

export function categorize(link: FirecrawlLink): { category: PageCategory; weight: number; matched: string } | null {
  const tokens = tokensOf(link.url);
  const haystack = `${link.title ?? ''} ${link.description ?? ''}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    const hit = rule.keywords.find((k) => tokens.includes(k));
    if (hit) return { category: rule.category, weight: rule.weight, matched: `path:${hit}` };
  }
  // Title and description are a fallback, not the primary signal — most links
  // in a real map response carry neither.
  for (const rule of CATEGORY_RULES) {
    const hit = rule.keywords.find((k) => k.length > 4 && haystack.includes(k));
    if (hit) return { category: rule.category, weight: rule.weight - 1, matched: `meta:${hit}` };
  }
  return null;
}

/**
 * Categorise a page by the words the company put in its own navigation.
 *
 * WHY THIS EXISTS. Path-driven selection assumes the path says something, and
 * a Squarespace or Wix site whose slugs were never renamed says nothing at all.
 * On adventurelabworks.com (read 2026-09-05) the nav pointed at /new-page,
 * /new-page-1, /new-page-3 and /new-page-46 — Contact, Values, About and
 * Affiliations. `categorize` returned null for every one of them, so they were
 * dropped from the candidate pool entirely, and the run missed the best fact on
 * the site: "the team consists of eight professional sales representatives
 * covering fifteen states", in the owner's own voice, on /new-page-3. Whatever
 * a company links in its own header is, by definition, what it thinks matters.
 */
export function categorizeLabel(label: string): { category: PageCategory; weight: number; matched: string } | null {
  const tokens = label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const joined = tokens.join('-');
  for (const rule of CATEGORY_RULES) {
    const hit = rule.keywords.find((k) => tokens.includes(k) || k === joined);
    if (hit) return { category: rule.category, weight: rule.weight, matched: `nav:${hit}` };
  }
  return null;
}

/**
 * Same-domain links in document order, with their anchor text. The navigation
 * is the first thing in a scraped page, so the first handful of unique links
 * are the header — and taking them in order means the mobile and desktop copies
 * of one menu collapse into a single entry.
 */
export function navLinksFrom(markdown: string, domain: string, limit = 20): NavHint[] {
  const found: NavHint[] = [];
  const seen = new Set<string>();
  for (const m of markdown.matchAll(/\[([^\]\n]{1,60})\]\((https?:\/\/[^)\s]+)\)/g)) {
    const label = m[1].replace(/[*_`!]/g, '').trim();
    /* Fragments off, and the trailing slash with them. A hero link labelled
       "Welcome" pointing at /#intro is the homepage, and without this it came
       back as a second, separate page to scrape. */
    const url = m[2].replace(/[).,;]+$/, '').replace(/#.*$/, '').replace(/\/$/, '');
    if (label.length < 2) continue;
    if (!/^https?:\/\/[^/]+\/.+/.test(url)) continue;
    if (registrableDomain(url) !== domain) continue;
    const key = url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ url, label });
    if (found.length >= limit) break;
  }
  return found;
}

/**
 * Choose pages to scrape. Homepage always, then by weight, with a per-category
 * cap so one sprawling section can't consume the whole page budget.
 *
 * `navHints` come from the homepage's own menu (see `navLinksFrom`). They can
 * add URLs the path rules scored as nothing, and they win over a path guess
 * when the label is the stronger signal — a link labelled About pointing at
 * /new-page-3 is an about page whatever its slug says.
 */
export function selectPages(
  links: FirecrawlLink[],
  domain: string,
  limit: number,
  navHints: NavHint[] = []
): SelectedPage[] {
  const selected: SelectedPage[] = [];
  const counts = new Map<PageCategory, number>();
  const seen = new Set<string>();

  const home = links.find((l) => isHome(l.url, domain));
  if (home) {
    selected.push({
      url: home.url,
      category: 'home',
      weight: 100,
      matched: 'homepage',
      titleFromMap: home.title,
      descriptionFromMap: home.description,
    });
    seen.add(home.url.replace(/\/$/, ''));
  }

  /* Nav hints, keyed the same way `seen` is. A label that matches no rule is
     still kept, at a weight below every category, so it fills leftover budget
     rather than displacing an ops-describing page. */
  type Hit = { category: PageCategory; weight: number; matched: string };
  const hints = new Map<string, Hit>();
  for (const hint of navHints) {
    const key = hint.url.replace(/\/$/, '');
    if (seen.has(key)) continue;
    if (SKIP_PATTERNS.some((p) => p.test(hint.url))) continue;
    hints.set(
      key,
      categorizeLabel(hint.label) ?? {
        category: 'other',
        weight: 2,
        matched: `nav:"${hint.label.slice(0, 30)}"`,
      }
    );
  }

  /* URLs the map never returned, or returned and the path rules scored as
     nothing, still reachable from the header. */
  const pool: FirecrawlLink[] = [...links];
  const inPool = new Set(links.map((l) => l.url.replace(/\/$/, '')));
  for (const key of hints.keys()) {
    if (!inPool.has(key)) pool.push({ url: key });
  }

  const scored = pool
    .filter((l) => !seen.has(l.url.replace(/\/$/, '')))
    .filter((l) => !SKIP_PATTERNS.some((p) => p.test(l.url)))
    .map((l) => {
      const byPath = categorize(l);
      const byNav = hints.get(l.url.replace(/\/$/, '')) ?? null;
      /* Whichever signal is stronger. On a tie the path wins, which keeps every
         pre-nav run's selection identical. */
      const hit = !byNav ? byPath : !byPath ? byNav : byNav.weight > byPath.weight ? byNav : byPath;
      return { link: l, hit };
    })
    .filter((x): x is { link: FirecrawlLink; hit: Hit } => x.hit !== null)
    .sort((a, b) => b.hit.weight - a.hit.weight || a.link.url.length - b.link.url.length);

  for (const { link, hit } of scored) {
    if (selected.length >= limit) break;
    const cap =
      hit.category === 'other'
        ? NAV_OTHER_CAP
        : CATEGORY_RULES.find((r) => r.category === hit.category)?.cap ?? 2;
    const used = counts.get(hit.category) ?? 0;
    if (used >= cap) continue;
    counts.set(hit.category, used + 1);
    seen.add(link.url.replace(/\/$/, ''));
    selected.push({
      url: link.url,
      category: hit.category,
      weight: hit.weight,
      matched: hit.matched,
      titleFromMap: link.title,
      descriptionFromMap: link.description,
    });
  }

  return selected;
}

/* -- signal extraction -------------------------------------------------- */

/**
 * Phrases that mean "a person does this step by hand". Each one is a hook for
 * a hypothesis claim later, and because we keep the surrounding quotation, the
 * claim cites their own words rather than our characterisation of them.
 */
const MANUAL_WORK_PHRASES = [
  'call us', 'give us a call', 'call our', 'phone in', 'by phone', 'over the phone',
  'fax', 'faxed', 'by mail', 'mail in', 'email us', 'email your', 'send us an email',
  'manually', 'by hand', 'paper', 'paperwork', 'spreadsheet', 'data entry',
  'our team will', 'a representative will', 'we will contact you', 'we will get back',
  'business days', 'allow up to', 'please complete', 'fill out', 'submit the form',
  'download the form', 'print', 'sign and return', 'requires approval', 'prior authorization',
];

/** Systems of record worth naming. A named system is an integration surface. */
const SYSTEMS_OF_RECORD = [
  'Epic', 'Cerner', 'Oracle Health', 'Meditech', 'Allscripts', 'athenahealth',
  'eClinicalWorks', 'NextGen', 'Point Click Care', 'PointClickCare', 'MatrixCare',
  'WellSky', 'Homecare Homebase', 'Netsmart', 'Surescripts', 'McKesson', 'Cardinal Health',
  'Salesforce', 'HubSpot', 'NetSuite', 'SAP', 'QuickBooks', 'Sage', 'Workday', 'ADP',
  'Shopify', 'Zendesk', 'ServiceNow', 'Jira', 'Slack', 'Microsoft Teams', 'SharePoint',
  'Snowflake', 'Databricks', 'Twilio', 'Stripe', 'DocuSign', 'HL7', 'FHIR', 'EDI', 'X12',
];

const AI_TERMS = [
  'artificial intelligence', 'machine learning', 'a.i.', ' ai ', 'ai-powered', 'ai powered',
  'llm', 'large language model', 'copilot', 'chatbot', 'chat bot', 'automation', 'automated',
  'predictive', 'algorithm', 'gpt', 'generative',
];

export interface PageSignals {
  url: string;
  category: PageCategory;
  title?: string;
  description?: string;
  wordCount: number;
  /** Verbatim quotations. Never paraphrased — they end up in claims. */
  manualWorkQuotes: { phrase: string; quote: string }[];
  systemsNamed: string[];
  aiTermsFound: string[];
  /** Careers pages only: lines that look like a role listing. */
  roleLines: string[];
  /**
   * Roster pages only: the titles the people on the page carry. The same lines
   * `roleLines` would have caught, kept under a name that says what they are —
   * a description of the team that exists, not of work being hired for.
   */
  rosterTitles: string[];
  skipped?: string;
}

/** Sentence containing `phrase`, trimmed to something quotable. */
function quoteAround(text: string, index: number, phrase: string): string {
  const start = Math.max(0, text.lastIndexOf('.', index) + 1);
  const endDot = text.indexOf('.', index + phrase.length);
  const end = endDot === -1 ? Math.min(text.length, index + 160) : endDot + 1;
  return text
    .slice(start, end)
    // Escaped markdown ("\\ \\ **Request Care Today**") leaked into the live
    // report; strip the escapes and emphasis so the quote reads as the page does.
    .replace(/\\+/g, ' ')
    .replace(/\*\*?/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-*>#|]+/, '')
    .trim()
    .slice(0, 240);
}

/**
 * Boilerplate that belongs to the browser or the scrape, not to the company.
 *
 * The live meridianmedicalsupply.com run quoted this into the report as a
 * description of one of their manual steps:
 *
 *   "ERR_BLOCKED_BY_CLIENT Reload This page has been blocked by an extension
 *    × Contact Us Please fill out this form…"
 *
 * The matched phrase ("fill out") was real and the page really said it. The
 * first half is a browser extension's error message that Firecrawl captured
 * and we then attributed to the prospect. "Skip to main content" reached a
 * report the same way. Quoting a company's own words back to them is the most
 * persuasive move this report has, and it only works if the words are theirs.
 */
const SCRAPE_NOISE = [
  // Article and listing furniture. The live senderrarx.com run quoted
  // "4 min read How Specialty Pharmacy Technology is Freeing Nurses' Time
  // Senderra : Mar 6, 2022, 9:56:57 PM News Senderra Specialty Pharmacy..."
  // as a description of a manual step. It is a blog index row.
  'min read', 'minute read', 'read more', 'share this', 'posted on',
  'published on', 'filed under', 'tagged with', 'related posts', 'next post',
  'previous post', 'subscribe to our', 'sign up for our newsletter',
  'err_blocked', 'err_', 'blocked by an extension', 'blocked by client',
  'skip to main content', 'skip to content', 'enable javascript',
  'javascript is disabled', 'your browser', 'browser does not support',
  'page not found', '404 error', 'access denied', 'are you a robot',
  'accept cookies', 'cookie policy', 'we use cookies', 'loading...',
  'please wait while', 'this site requires', 'update your browser',
];

export function looksLikeScrapeNoise(quote: string): boolean {
  const flat = quote.toLowerCase();
  return SCRAPE_NOISE.some((n) => flat.includes(n));
}

/**
 * True for a menu, product list or table fragment rather than prose.
 *
 * The live hpsrx.com run quoted this into the report as a description of a
 * manual step:
 *
 *   "Tenaculum Hooks Uterine Sounds Forceps Metal Curettes Biopsy Punches
 *    Dilators Speculums Needle Extenders Scissors Surgical Supplies…"
 *
 * It is a product menu that happened to sit near a matched phrase. The signal
 * that separates it from prose is function words: real sentences are full of
 * lowercase connective vocabulary ("we will contact you and provide you with"),
 * and a run of Title Case nouns has almost none.
 */
export function looksLikeNavigation(quote: string): boolean {
  if (/[|\u2502]/.test(quote)) return true;
  const lowercaseWords = quote
    .split(/\s+/)
    .filter((w) => /^[a-z][a-z'-]{1,}$/.test(w));
  return lowercaseWords.length < 4;
}

/**
 * System names that are also ordinary English words.
 *
 * A case-insensitive word match told Cultivate Advisors — a business coaching
 * firm — that their work runs through Epic, the hospital EHR. Their page said
 * something was epic. The claim then reached the analyst, which turned it into
 * a question about their clinical systems, and the whole report looked like it
 * had not been read by anyone.
 *
 * For these names we require the exact capitalisation and refuse a match at the
 * start of a sentence, where any word is capitalised. Unambiguous names like
 * "PointClickCare" keep the loose match.
 */
const AMBIGUOUS_SYSTEMS = new Set([
  'Epic', 'Sage', 'Slack', 'Workday', 'Jira', 'Stripe', 'Shopify', 'SAP', 'EDI',
]);

export function namesSystem(text: string, system: string): boolean {
  const escaped = system.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!AMBIGUOUS_SYSTEMS.has(system)) {
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  /* Exact case, and never sentence-initial — including the very start of the
     text, where a heading like "Epic growth is what we deliver" would otherwise
     match. Requiring mid-sentence context costs us a real mention that happens
     to open a page, and that is the safer way to be wrong. */
  const re = new RegExp(`\\b${escaped}\\b`, 'g');
  for (const m of text.matchAll(re)) {
    if (m.index === 0) continue;
    const before = text.slice(0, m.index);
    if (/(^|[.!?])\s*$/.test(before)) continue;
    return true;
  }
  return false;
}

export function extractSignals(
  page: SelectedPage,
  markdown: string,
  title?: string,
  description?: string
): PageSignals {
  // Strip image markup and link targets so URLs don't count as prose.
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Heading markers, before quoting rather than after: a quotation spanning
    // a heading boundary otherwise carries "####" into the report.
    .replace(/#+/g, ' ')
    .replace(/\s+/g, ' ');
  const lower = text.toLowerCase();

  const manualWorkQuotes: { phrase: string; quote: string }[] = [];
  for (const phrase of MANUAL_WORK_PHRASES) {
    const index = lower.indexOf(phrase);
    if (index === -1) continue;
    const quote = quoteAround(text, index, phrase);
    if (quote.length < 20) continue;
    if (looksLikeNavigation(quote)) continue;
    if (looksLikeScrapeNoise(quote)) continue;
    if (manualWorkQuotes.some((q) => q.quote === quote)) continue;
    manualWorkQuotes.push({ phrase: phrase.trim(), quote });
  }

  const systemsNamed = SYSTEMS_OF_RECORD.filter((s) => namesSystem(text, s));

  const aiTermsFound = AI_TERMS.filter((t) => lower.includes(t)).map((t) => t.trim());

  /* A path guess is not enough to call something a job board, because the
     inference drawn from one ("this work is under strain") is load-bearing
     across every idea the report weighs. So the page has to read like a job
     board too: /careers-and-culture and /join-our-team are as often rosters as
     adverts. Reclassified here rather than in `categorize`, because only the
     scraped text can tell them apart. */
  const category: PageCategory =
    page.category === 'careers' && looksLikeRoster(text) ? 'roster' : page.category;

  const titleLines = [...new Set(
    markdown
      // Same link and image stripping as the prose above: the live run
      // put "(Talk to a Care Specialist)(https://…/request-care/)" into
      // the report as a job title.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/\S+/g, ' ')
      .split('\n')
      .map((l) => l.replace(/^[\s\-*#>|]+/, '').trim())
      /* A title and the prose under it often arrive as one line — a roster
         card's subtitle runs straight into the biography, and a job advert's
         heading into the description. Split the long ones into sentences and
         keep whichever sentence is the title, rather than dropping the line
         for being too long: "Territory Manager: MT & Northern ID. I grew up
         enjoying the outdoors…" is a title with a life story attached. */
      .flatMap((l) => (l.length < 90 ? [l] : l.split(/(?<=[.!?])\s+/)))
      .map((l) => l.replace(/^[\s*_]+|[\s*_]+$/g, '').trim())
      .filter((l) => l.length > 3 && l.length < 90)
      .filter((l) => TITLE_WORD.test(l))
  )];

  return {
    url: page.url,
    category,
    title,
    description,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    manualWorkQuotes,
    systemsNamed,
    aiTermsFound,
    roleLines: category === 'careers' ? titleLines : [],
    /* Titles only, not every sentence that happens to contain the word
       "manager". A roster claim is client-facing — it reads their own team
       back to them — so "For several years, I worked in Bicycle Retail as a
       manager and buyer" appearing in a list of job titles is the kind of
       thing that ends a first call. `roleLines` keeps the looser filter it
       was tested against on live careers pages. */
    rosterTitles: category === 'roster' ? titleLines.filter(looksLikeTitle) : [],
  };
}

/**
 * Is this line a job title, or a sentence with a job title in it?
 *
 * Three tests, all learned from adventurelabworks.com/team: no first-person
 * pronoun, because nobody writes their own title in the first person; short,
 * because a title is a phrase and not a clause; and the role word near the
 * front, because "Territory Manager: MT & Northern ID" leads with it while a
 * biography buries it.
 */
export function looksLikeTitle(line: string): boolean {
  if (/\b(i|my|me|we|our|us|he|she|they|his|her|their)\b/i.test(line)) return false;
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length > 10) return false;
  return TITLE_WORD.test(words.slice(0, 4).join(' '));
}

/**
 * Does this page describe people who work here, rather than work being hired
 * for? Two signals, either of which is enough, both taken from the live
 * adventurelabworks.com/team page:
 *
 *   1. First-person past-tense biography. "I grew up", "I began my career",
 *      "my wife" — nobody writes a job advert that way.
 *   2. A title bound to a named person, repeatedly: "Dave Klopp / Territory
 *      Manager: MT & Northern ID" three times over is a roster.
 *
 * The opposite signals — an apply button, an employment-type line, a salary
 * range — are what a real job board carries, and they veto the reclassification
 * so that a careers page with staff testimonials on it stays a careers page.
 */
export function looksLikeRoster(text: string): boolean {
  const hiringLanguage =
    /\b(apply now|apply here|apply today|how to apply|submit your (resume|résumé|cv|application)|open (position|role|vacanc)|current (opening|vacanc)|we(?:'| a)re hiring|now hiring|full[- ]time|part[- ]time|salary range|pay range|job description|equal opportunity employer)\b/i;
  if (hiringLanguage.test(text)) return false;

  const firstPersonBio =
    (text.match(/\bI\s+(grew|was born|was raised|began|started|moved|joined|have (?:been|lived|always)|live|enjoy|spent)\b/g) ?? []).length +
    (text.match(/\bmy\s+(wife|husband|partner|family|kids|children|daughters?|sons?|dog|hometown|career|free time)\b/gi) ?? []).length;
  if (firstPersonBio >= 2) return true;

  /* A person's name immediately followed by a job title. Two or more of them
     and the page is a list of people, whatever its path says. */
  const namedTitles =
    text.match(
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s*[-–—:|]?\s*(?:Territory\s+Manager|Sales\s+(?:Manager|Representative|Rep)|Account\s+(?:Manager|Executive)|Managing\s+Director|Agency\s+Principal|Principal|President|Owner|Founder|Partner|Director|Manager)\b/g
    ) ?? [];
  return namedTitles.length >= 2;
}

/* -- redirects ----------------------------------------------------------- */

/**
 * The domain the site actually lives on.
 *
 * Companies rebrand and redirect, and the intake form collects the domain the
 * prospect typed. On the live run, `traditionshealth.com` 301s to
 * `tct-cares.com`: all 60 mapped URLs came back on the new host, so `isHome`
 * matched nothing, the homepage was never scraped, and the category query fell
 * through to a contact page's boilerplate — which then drove peer discovery to
 * "24/7 nursing" companies. One redirect, and the make-or-break stage was
 * searching for the wrong category.
 *
 * So the effective domain is read back from the map response rather than
 * assumed. The requested domain is kept alongside it: which name the prospect
 * used is worth knowing, and a rebrand is itself a fact about the account.
 */
export function dominantDomain(links: FirecrawlLink[]): string {
  const counts = new Map<string, number>();
  for (const link of links) {
    const domain = registrableDomain(link.url);
    if (!domain) continue;
    counts.set(domain, (counts.get(domain) ?? 0) + 1);
  }
  let best = '';
  let bestCount = 0;
  for (const [domain, count] of counts) {
    if (count > bestCount) {
      best = domain;
      bestCount = count;
    }
  }
  return best;
}

/* -- category query for stage 02 ---------------------------------------- */

/**
 * The natural-language description of what this company *is*, which stage 02
 * feeds to Exa's company search. Getting this right is most of what makes peer
 * discovery work, so it is derived from their own self-description rather than
 * from the domain name or a template.
 *
 * The subject's own name is stripped: a query containing "HPSRx" retrieves
 * pages about HPSRx, which is precisely the failure mode stage 02 exists to
 * avoid. Overridable from the CLI, because a human who knows the account will
 * beat this heuristic and should be able to say so.
 */
/**
 * A regex body matching a domain's brand label as it appears in prose.
 *
 * Domain labels concatenate words that the copy separates: `traditionshealth.com`
 * is written "Traditions Health" on the page, so a plain `\btraditionshealth\b`
 * matches nothing and the company's own name survives into the category query.
 * So for a label long enough to be distinctive, separators are allowed between
 * its characters. Short labels keep the strict form, because a loose three-letter
 * pattern matches most of the language.
 */
export function brandPattern(brand: string): string | null {
  const letters = brand.replace(/[^a-z0-9]/gi, '');
  if (letters.length < 3) return null;
  const escape = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (letters.length < 6) return escape(letters);
  return letters.split('').map(escape).join("[\\s.'-]{0,2}");
}

export function deriveCategoryQuery(
  signals: PageSignals[],
  domain: string,
  alsoStrip: string[] = []
): { query: string; seedText: string; derivedFrom: string; usable: boolean } {
  /**
   * Contact-page boilerplate is not a category description.
   *
   * "Contact us. Our team is available 24 hours a day, 7 days a week to assist
   * patients, caregivers, and health care providers" became the live category
   * query for a hospice provider, and Exa duly returned 24/7 answering
   * services: 24/7 Nursing Care, 24/7 Coastal Contact, 24ourCare, Hospice On
   * Call. Every one of them matched the query. None of them was the category.
   */
  const isContactBoilerplate = (url: string, text: string) =>
    /\/(contact|contact-us|get-in-touch|request|locations?)(\/|$)/i.test(url) ||
    // Call-to-action openers. "Discover the difference. Call 833.380.9583 today
    // to learn more about our in-home hospice services" became the live
    // category query for a 300-programme hospice operator, and peer discovery
    // returned six single-location agencies instead of its actual competitors.
    /^(contact|call|email|reach|get in touch|request|speak|talk|schedule|book|discover|learn|find out|get started|see how|explore|welcome|looking for|need help)\b/i.test(
      text.trim()
    ) ||
    // A phone number in a meta description means it is an advert, not a
    // description of the business.
    /(\+?\d[\d\s().-]{8,}\d)/.test(text) ||
    /\b(24 hours a day|7 days a week|business hours|toll[- ]free|call today|call now)\b/i.test(text);

  const preferred: PageCategory[] = ['home', 'company', 'product'];
  const candidates = preferred
    .flatMap((c) => signals.filter((s) => s.category === c))
    .flatMap((s) => [
      { text: s.description ?? '', from: `${s.url} (meta description)`, url: s.url },
      { text: s.title ?? '', from: `${s.url} (title)`, url: s.url },
    ])
    .filter((c) => c.text.trim().length > 40)
    .filter((c) => !isContactBoilerplate(c.url, c.text));

  const brands = [domain.split('.')[0], ...alsoStrip.map((d) => d.split('.')[0])].filter(Boolean);
  const brand = brands[0] ?? '';

  /**
   * Legal-suffix words, for stripping a company name down to its category.
   *
   * Applied *repeatedly at the start* of the remainder, because real
   * descriptions stack them. On the live hpsrx.com run the meta description
   * was "HPSRx Enterprises, Inc. is a small specialty distributor in women's
   * health…"; removing one suffix left "Inc. is a small specialty
   * distributor…", and that string went to Exa as the category description and
   * to stage 04 as the seed for the demand pull. Peer discovery survived it,
   * but a category query that opens with a legal suffix is a category query
   * nobody proofread.
   */
  const LEGAL_SUFFIX =
    "inc|llc|l\\.l\\.c|ltd|limited|corp|corporation|co|company|plc|gmbh|pvt|private|" +
    "enterprises|enterprise|group|holdings|international|usa|partners|associates";

  const strip = (text: string) => {
    // Every brand the company answers to: a redirect means the old name and
    // the new one can both appear in the copy.
    let out = text;
    for (const b of brands) {
      const pattern = brandPattern(b);
      if (!pattern) continue;
      out = out
        .replace(new RegExp(`\\b${pattern}\\b[a-z ,.]*?\\b(${LEGAL_SUFFIX})\\b\\.?`, 'gi'), '')
        .replace(new RegExp(`\\b${pattern}\\b'?s?`, 'gi'), '');
    }
    out = out.replace(/\s{2,}/g, ' ');

    // Peel leading punctuation, orphaned legal suffixes and a leading copula
    // in a loop: removing any one of them can expose another.
    let previous: string;
    do {
      previous = out;
      out = out
        .replace(/^[\s,.\-–—|:;]+/, '')
        .replace(new RegExp(`^(${LEGAL_SUFFIX})\\b\\.?`, 'i'), '')
        .replace(/^(is|are|was|were|we|the|a|an)\s+/i, '');
    } while (out !== previous);

    return out.trim();
  };

  /**
   * TWO OUTPUTS, because the two consumers want opposite things — and this was
   * learned the hard way, by breaking one to fix the other.
   *
   * `seedText` is the first sentence or two. The live hpsrx.com description ran
   * 300 characters and closed with "Our dedicated team provides excellent
   * customer service on a first name basis. We are licensed to ship to all 50
   * states", and stage 04 duly paid to measure US search demand for "first
   * name" and "excellent customer". Trimming to the opening sentences fixed
   * that.
   *
   * `query` is the whole description, because trimming it made peer discovery
   * measurably worse. The short version of the HPSRx description returned a
   * Zimbabwean healthcare distributor and a Middle Eastern pharmaceutical
   * trader in place of AMSCO Medical, MedGyn and Mazza Healthcare: the
   * incidental detail Exa needs to locate a *specific* niche is exactly the
   * filler that ruins a keyword list.
   *
   * So the trailing sentences are noise to one stage and signal to the other,
   * and the fix is to stop making them share one string.
   */
  const firstSentences = (text: string, count = 2) => {
    const parts = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
    const kept = parts.slice(0, count).join(' ').trim();
    return (kept.length >= 40 ? kept : text).slice(0, 300);
  };

  for (const candidate of candidates) {
    const stripped = strip(candidate.text);
    if (stripped.length >= 40) {
      const query = stripped.slice(0, 300);
      /* Checked even though it came from their own page: a homepage whose
         description is the company name and a tagline strips down to nothing
         worth searching with. */
      const verdict = assessCategoryQuery(query, domain);
      return {
        query,
        seedText: firstSentences(stripped),
        derivedFrom: verdict.usable ? candidate.from : `${candidate.from} — unusable: ${verdict.reason}`,
        usable: verdict.usable,
      };
    }
  }
  /**
   * No self-description anywhere on the pages we read.
   *
   * This string used to be returned as if it were a category, and on
   * adventurelabworks.com (2026-09-05) it was: their homepage title is two
   * words and their meta description is empty, so "companies similar to
   * adventurelabworks.com" went to Exa, which returned similarground.org and
   * similarinc.com, and to DataForSEO, which duly priced the search term
   * "similar" — 90,500 US searches a month, up 57.2%. Four of the six claims
   * in that report were about the word "similar", and both stages billed.
   *
   * It is still returned, because the note is worth printing. `usable: false`
   * is what stops anyone spending on it.
   */
  const fallback = `companies similar to ${domain}`;
  return {
    query: fallback,
    seedText: fallback,
    derivedFrom: 'fallback — no usable self-description found on the site',
    usable: false,
  };
}

/**
 * Is this string a description of a category, or a description of the subject?
 *
 * Applied to a supplied `--category` as well as a derived one, because the
 * failure is just as expensive when a person types it: peer discovery searches
 * with whatever it is given, and the demand pull seeds keywords from the same
 * text. Anything self-referential — "companies similar to x.com", "competitors
 * of x", a bare domain or brand name — retrieves the subject and pages about
 * the subject, which is the one thing stage 02 exists to avoid.
 *
 * Deliberately narrow. It rejects strings that are *about* similarity or
 * identity rather than trying to judge whether a category is a good one; a
 * mediocre category still beats a stopped run.
 */
export function assessCategoryQuery(query: string, domain: string): { usable: boolean; reason?: string } {
  const text = query.trim();
  if (text.length < 20) return { usable: false, reason: 'too short to describe a category' };

  if (/^(companies|firms|businesses|organi[sz]ations)\s+(similar\s+to|like)\b/i.test(text)) {
    return { usable: false, reason: 'names similarity rather than a category' };
  }
  if (/^(competitors?|alternatives?|rivals)\s+(to|of|for)\b/i.test(text)) {
    return { usable: false, reason: 'names competition rather than a category' };
  }

  /* What is left once the subject's own identity is removed. A category query
     that is nothing but the company's name and a domain describes one company,
     and Exa will find that company. */
  const label = domain.split('.')[0] ?? '';
  const pattern = brandPattern(label);
  const remainder = text
    .replace(new RegExp(`\\b${label}\\b`, 'gi'), ' ')
    .replace(pattern ? new RegExp(`\\b${pattern}\\b`, 'gi') : /$^/g, ' ')
    .replace(/\b[a-z0-9-]+\.(com|net|org|co|io|ai|us)\b/gi, ' ')
    .replace(/\b(similar|companies|company|like|to|the|a|an|and|of|for|in|with)\b/gi, ' ')
    .replace(/[^a-z\s]/gi, ' ')
    .trim();
  const substantive = remainder.split(/\s+/).filter((w) => w.length >= 4);
  if (substantive.length < 2) {
    return { usable: false, reason: 'nothing left once the subject’s own name is removed' };
  }

  return { usable: true };
}

/* -- scale ---------------------------------------------------------------- */

/**
 * How big they are, from their own site map.
 *
 * WHY THIS EXISTS. Peer discovery searches with a description of the category,
 * and a description of the category says nothing about size. Live 2026-09-04:
 * compassus.com, a national provider with programmes in thirty states, was
 * described by its own homepage title as "Home Health, Infusion, Hospice, &
 * Palliative Care" — true, on topic, and shared with several thousand
 * single-location agencies. Exa returned eight of those, and a report that
 * compares a billion-dollar operator to Blossom Ridge Home Health has lost the
 * reader by the second page.
 *
 * The signal is sitting in the map response that stage 01 already pays for: a
 * company with locations in thirty states publishes thirty location pages. So
 * count them, name the states, and hand peer discovery a clause it can search
 * with. Deterministic, no extra call, and every number traces to a path on
 * their site.
 *
 * It is a floor, not a measure: a national operator with one page per region
 * looks small here. Where it says nothing, it says nothing rather than
 * guessing, and a teammate's `--category` still beats it.
 */
const STATES: Record<string, string> = {
  al: 'Alabama', ak: 'Alaska', az: 'Arizona', ar: 'Arkansas', ca: 'California',
  co: 'Colorado', ct: 'Connecticut', de: 'Delaware', fl: 'Florida', ga: 'Georgia',
  hi: 'Hawaii', id: 'Idaho', il: 'Illinois', in: 'Indiana', ia: 'Iowa',
  ks: 'Kansas', ky: 'Kentucky', la: 'Louisiana', me: 'Maine', md: 'Maryland',
  ma: 'Massachusetts', mi: 'Michigan', mn: 'Minnesota', ms: 'Mississippi',
  mo: 'Missouri', mt: 'Montana', ne: 'Nebraska', nv: 'Nevada', nh: 'New Hampshire',
  nj: 'New Jersey', nm: 'New Mexico', ny: 'New York', nc: 'North Carolina',
  nd: 'North Dakota', oh: 'Ohio', ok: 'Oklahoma', or: 'Oregon', pa: 'Pennsylvania',
  ri: 'Rhode Island', sc: 'South Carolina', sd: 'South Dakota', tn: 'Tennessee',
  tx: 'Texas', ut: 'Utah', vt: 'Vermont', va: 'Virginia', wa: 'Washington',
  wv: 'West Virginia', wi: 'Wisconsin', wy: 'Wyoming', dc: 'District of Columbia',
};

const BY_NAME: Record<string, string> = Object.fromEntries(
  Object.values(STATES).map((name) => [name.toLowerCase().replace(/\s+/g, '-'), name])
);

/** Path segments that mean "here is where we operate". */
const FOOTPRINT_SEGMENTS = [
  'location', 'locations', 'our-locations', 'service-area', 'service-areas',
  'areas-we-serve', 'where-we-serve', 'branches', 'offices', 'centers',
  'centres', 'clinics', 'facilities', 'markets', 'programs', 'programmes',
];

export interface Scale {
  /** Pages on their own site that describe a place they operate. */
  footprintPages: number;
  /** US states named in those paths, in the order first seen. */
  states: string[];
  /** A clause for the category query. Empty when the map says nothing. */
  phrase: string;
}

export function deriveScale(links: FirecrawlLink[], domain: string): Scale {
  const seen = new Set<string>();
  const states: string[] = [];
  let footprintPages = 0;

  for (const link of links) {
    if (registrableDomain(link.url) !== domain) continue;
    let segments: string[];
    try {
      segments = new URL(link.url).pathname.toLowerCase().split('/').filter(Boolean);
    } catch {
      continue;
    }
    const at = segments.findIndex((seg) => FOOTPRINT_SEGMENTS.includes(seg));
    if (at === -1) continue;
    footprintPages += 1;
    /* Only a segment *under* the footprint path counts as a state, so a
       two-letter word elsewhere in a URL cannot become Indiana. */
    for (const seg of segments.slice(at + 1)) {
      const state = BY_NAME[seg] ?? (seg.length === 2 ? STATES[seg] : undefined);
      if (!state || seen.has(state)) continue;
      seen.add(state);
      states.push(state);
    }
  }

  /* Wording tested against Exa on compassus.com, 2026-09-04, four shapes for
     $0.05. The bare category query returned eight single-location agencies and
     no national operator. This wording pulled VITAS and LHC Group into the
     candidate pool. What worked *best* was a sentence naming scale and
     ownership — "large national … hundreds of programs … owned by private
     equity or a health system" returned Amedisys, Aveanna, Kindred, LHC Group
     and VITAS — and neither "hundreds of programs" nor "private equity" is
     derivable from a crawl. So this clause is a partial fix by construction,
     and a teammate's own `--category` line is the real one. See the README. */
  let phrase = '';
  if (states.length >= 8) {
    phrase = `A large national provider operating in ${states.length} states across ${footprintPages} locations.`;
  } else if (states.length >= 3) {
    phrase = `A multi-state provider operating in ${states.join(', ')}.`;
  } else if (footprintPages >= 10) {
    phrase = `A multi-site operator with ${footprintPages} locations.`;
  }

  return { footprintPages, states, phrase };
}

/* -- the stage ---------------------------------------------------------- */

export interface SubjectArtifact {
  domain: string;
  /** Where the site actually lives, if the requested domain redirects. */
  effectiveDomain: string;
  crawledAt: string;
  robots: { host: string; published: boolean; crawlDelayMs?: number; disallowRules: number };
  mapped: number;
  selected: SelectedPage[];
  pages: PageSignals[];
  pagesCrawled: number;
  /**
   * What stage 02 searches with and stage 04 seeds from. `usable: false` means
   * neither may spend: see `assessCategoryQuery`.
   */
  categoryQuery: { query: string; seedText: string; derivedFrom: string; usable: boolean };
  /** How big their footprint looks from their own site map. */
  scale: Scale;
  /** Categories the site simply doesn't have. The thin-target diagnosis. */
  categoriesMissing: PageCategory[];
  notes: string[];
}

export interface SubjectOptions {
  mapLimit?: number;
  pageLimit?: number;
  /** Pages scraped concurrently. Defaults to PAGE_CONCURRENCY. */
  concurrency?: number;
  categoryQueryOverride?: string;
}

export async function runSubjectStage(
  cache: CacheOptions,
  ledger: Ledger,
  domain: string,
  now: string,
  opts: SubjectOptions = {}
): Promise<SubjectArtifact> {
  const notes: string[] = [];
  const homeUrl = `https://${domain}`;
  const robots = await robotsFor(homeUrl);

  const mapped = await map(cache, ledger, domain, opts.mapLimit ?? 60, now);
  const links = mapped.links ?? [];
  if (links.length === 0) notes.push('Firecrawl map returned no links — the site may block crawling or be a single page.');

  const withTitles = links.filter((l) => l.title || l.description).length;
  notes.push(
    `map returned ${links.length} link(s), ${withTitles} with a title or description — ` +
      'selection is path-driven for exactly this reason'
  );

  // Where the site actually lives. A redirect here silently broke homepage
  // selection and, through it, peer discovery — see `dominantDomain`.
  const requested = registrableDomain(domain);
  const effectiveDomain = dominantDomain(links) || requested;
  if (effectiveDomain !== requested) {
    notes.push(
      `${requested} redirects to ${effectiveDomain} — ${links.length} of the mapped URLs are on ` +
        'the new host. Crawling and peer discovery follow the new domain; a rebrand is ' +
        'itself worth raising on the call.'
    );
  }

  /* The homepage first, on its own, so its navigation can inform which other
     pages are worth a credit. No extra API call: the homepage was always going
     to be scraped, and the second call for it below is served from cache. */
  let navHints: NavHint[] = [];
  const homeLink = links.find((l) => isHome(l.url, effectiveDomain));
  if (homeLink) {
    const homeScrape = await scrape(cache, ledger, homeLink.url, now);
    if (homeScrape.ok) {
      navHints = navLinksFrom(homeScrape.markdown, effectiveDomain);
      if (navHints.length > 0) {
        notes.push(
          `read ${navHints.length} link(s) from the homepage's own navigation — the labels there ` +
            'beat a path guess on a site whose slugs were never renamed'
        );
      }
    }
  }

  const selected = selectPages(links, effectiveDomain, opts.pageLimit ?? 12, navHints);
  const fromNav = selected.filter((p) => p.matched.startsWith('nav:'));
  if (fromNav.length > 0) {
    notes.push(
      `${fromNav.length} page(s) selected by nav label rather than path: ` +
        fromNav.map((p) => `${new URL(p.url).pathname} (${p.matched})`).join(', ')
    );
  }

  /* Scraped concurrently. Twelve pages in series was 48 seconds of a
     125-second run — see lib/concurrency.ts. Order is preserved so the
     artifact still reads in selection order. */
  const pages: PageSignals[] = await mapWithConcurrency(
    selected,
    opts.concurrency ?? PAGE_CONCURRENCY,
    async (page) => {
      const result = await scrape(cache, ledger, page.url, now);
      if (!result.ok) {
        return {
          url: page.url,
          category: page.category,
          wordCount: 0,
          manualWorkQuotes: [],
          systemsNamed: [],
          aiTermsFound: [],
          roleLines: [],
          rosterTitles: [],
          skipped: result.skipped ?? `scrape returned no markdown (status ${result.statusCode ?? '?'})`,
        };
      }
      return extractSignals(page, result.markdown, result.title, result.description);
    }
  );

  const present = new Set(pages.filter((p) => !p.skipped).map((p) => p.category));
  const categoriesMissing = (['help', 'careers', 'integrations', 'pricing'] as PageCategory[]).filter(
    (c) => !present.has(c)
  );
  if (categoriesMissing.length > 0) {
    notes.push(`no page found for: ${categoriesMissing.join(', ')} — the ops-describing pages are the yield`);
  }

  const derived = deriveCategoryQuery(
    pages,
    effectiveDomain,
    effectiveDomain === requested ? [] : [requested]
  );
  /* Scale goes to peer discovery, never to the demand pull: seedText feeds
     stage 04's keyword seeds, and "a national provider with locations in 30
     states" is not a term anyone searches for. */
  const scale = deriveScale(links, effectiveDomain);
  const withScale =
    scale.phrase && !opts.categoryQueryOverride
      ? { ...derived, query: `${derived.query}. ${scale.phrase}`, derivedFrom: `${derived.derivedFrom}, plus scale from ${scale.footprintPages} location page(s)` }
      : derived;
  if (scale.phrase) {
    notes.push(
      `footprint: ${scale.footprintPages} location page(s)` +
        (scale.states.length ? `, ${scale.states.length} state(s) named in their paths` : '') +
        (opts.categoryQueryOverride ? ' — not added to the supplied category query' : ' — appended to the category query so peer discovery searches at the right size')
    );
  }

  const supplied = opts.categoryQueryOverride
    ? assessCategoryQuery(opts.categoryQueryOverride, effectiveDomain)
    : null;
  const categoryQuery = opts.categoryQueryOverride
    ? {
        query: opts.categoryQueryOverride,
        seedText: opts.categoryQueryOverride,
        derivedFrom: supplied!.usable
          ? 'supplied on the command line'
          : `supplied on the command line — unusable: ${supplied!.reason}`,
        usable: supplied!.usable,
      }
    : withScale;
  if (opts.categoryQueryOverride) {
    notes.push(`category query overridden; derived query would have been: "${withScale.query}"`);
  }
  /* Loud, because the two stages this gates are the expensive half of the run
     and the ones whose output a reader takes at face value. */
  if (!categoryQuery.usable) {
    notes.push(
      `NO USABLE CATEGORY: ${categoryQuery.derivedFrom.replace(/^.*unusable: /, '')}. ` +
        'Peer discovery and the demand pull are skipped rather than searched with this — ' +
        'a query that describes the subject retrieves the subject. Re-run with --category ' +
        'naming what they do and for whom, in the shape "scale, ownership, buyer".'
    );
  }

  return {
    domain,
    effectiveDomain,
    crawledAt: now,
    robots: {
      host: robots.host,
      published: robots.fetched,
      crawlDelayMs: robots.crawlDelayMs,
      disallowRules: robots.rules.filter((r) => !r.allow).length,
    },
    mapped: links.length,
    selected,
    pages,
    pagesCrawled: pages.filter((p) => !p.skipped && p.wordCount > 0).length,
    categoryQuery,
    scale,
    categoriesMissing,
    notes,
  };
}
