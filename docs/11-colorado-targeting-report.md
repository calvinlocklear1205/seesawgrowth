# Colorado Targeting Report

*Companion to `03-targeting-report.md`, scoped to Colorado-HQ accounts and built for
LinkedIn outreach. Research pulled 2026-09-08.*

> **Dependency, flagged once:** Decision #1 (positioning) is still open. This report assumes
> the recommended position — design-led AI product studio with a care-operations wedge,
> healthcare-first in proof rather than healthcare-only in sales. If that call lands
> differently, the tiering below re-sorts but the account research holds.

## 0. Method, and what was different this time

The original report was built with Firecrawl, Exa, Perplexity and DataForSEO. **None of
those were available in this session** — only general web search and page fetch. Practical
consequences:

- **The ABM list is unaffected.** Tier A in `03` came from vendor-partnership press
  releases and vertical trade press, both of which plain search reproduces. Every trigger
  below is dated and linked to a primary or trade source.
- **No keyword data.** Nothing here depends on volume, difficulty or CPC. The DataForSEO
  re-pull flagged in `00-status.md` is still outstanding and still blocks SEO spend.
- **Thinner private-company financials.** Revenue and headcount figures that came from
  aggregators (PitchBook, ZoomInfo, RocketReach) are marked `Est.` and should not be
  repeated to a prospect.

Colorado is a much smaller pond than Texas: roughly 20 accounts are worth naming, not 66.
Padding the list to match the original's length would be the wrong instinct — at 4–6
qualified opportunities per quarter, a tight 19 with real triggers is more than enough
inventory.

## 1. The Colorado-specific wedge: SB 26-189

This is the strongest thing in this report and it does not exist in the Texas list.

Colorado's original AI Act (SB 24-205) was never implemented. It was postponed by SB 25B-004
(signed 2025-08-28), then **repealed and replaced by SB 26-189, signed 2026-05-14, effective
2027-01-01** ([Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-us/knowledge/publications/18733d31/colorado-enacts-revised-ai-law),
[Akin](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/colorado-postpones-implementation-of-colorado-ai-act-sb-24-205)).
The replacement drops the duty-of-care standard, mandatory risk-management programmes and
annual impact assessments, and narrows to **automated decision-making technology (ADMT)
that materially influences consequential decisions.** What survives is almost entirely
product-surface work:

| Obligation on deployers | What it actually is, in build terms |
|---|---|
| Clear and conspicuous notice that ADMT is in use | Disclosure UI in the member/patient flow |
| Explanation of an adverse outcome **within 30 days** | An explanation artifact, generated and delivered — decision logging, reason codes, a template, a delivery path |
| Consumer access to and correction of the personal data used | A data-access and correction surface, plus the write-back plumbing |
| Meaningful human review, by a designated trained person with authority to override | A reviewer queue, an override action, and an audit trail |

Developers additionally owe deployers documentation of intended and known harmful uses,
training-data categories, limitations and known risks, and instructions that make human
review possible.

**Why this is a good opener and not a scare tactic.** Every Colorado healthcare
organisation that bought an AI point solution in 2025–26 — and §2 is a list of them — now
has a January 2027 date by which the decision has to be explainable, correctable and
overridable *in the interface*. Nobody buys a compliance lecture, but "you have a reviewer
queue and an explanation screen to build by January" is a concrete, dated, design-shaped
problem, and it is exactly what a design-led studio sells. It also naturally surfaces the
wider unbuilt-workflow conversation.

**Two cautions.** Do not overstate the scope: SB 26-189 is materially narrower than the
2024 law, and a lot of commentary still describes the repealed version. Have counsel
confirm the reading before it goes into written outreach at volume, and never imply SeeSaw
offers a legal opinion.

## 2. Named accounts (19)

Same scoring as `03`: **A** = strong 2025–26 trigger + ICP fit + proof-point match · **B**
= ICP fit with a weaker or inferred trigger · **C** = watch. All HQs in Colorado unless
noted. Revenue and headcount are estimates unless sourced.

### Tier A (8) — approach first

| Company | HQ | Vertical | Trigger (dated) | Maps to |
|---|---|---|---|---|
| **Strive Health** | Denver | Value-based kidney care | $550M Series D ($300M equity + $250M debt); Care Multiplier ML platform; publicly co-developing AI with partner provider groups into 2026 | **Rendevor dialysis analytics** — the closest proof match in the whole list |
| **DispatchHealth** | Denver | In-home acute / hospital-at-home | 2026-07-31: refocused on **B2B enablement**, selling CESIA to health systems and risk-bearing providers. A repositioning of the platform as a product for a new buyer | AI product design, HIPAA workflow. `Est.` ~$700M raised, $1.7B valuation (PitchBook) |
| **SonderMind** | Denver | Behavioral health network | Agentic AI referral automation live (admin steps only, no clinical determinations); selected for the **FDA TEMPO pilot** for a smartphone anxiety/depression app | A regulated consumer product needing design — plus 16k+ providers of care-ops surface |
| **Carina Health Network** | Colorado | Nonprofit safety-net network | 2026-03-31: Innovaccer Healthcare Intelligence Cloud across **1,200+ providers / 400 sites, ~1.5M lives (~40% of state Medicaid)** | Care management. Textbook "bought the platform, owns none of the adjacent workflow" |
| **Colorado Access** | Aurora | Nonprofit Medicaid health plan | Innovaccer partnership (530k+ members) and a Vital Data Technology quality partnership; **CMS Interoperability & Prior Auth rule reporting obligations land in 2026** | **Pharmacy/prior-auth workflow — the HPS "5x faster medication approvals" proof** |
| **InnovAge** | Denver | PACE (all-inclusive elderly care) | Named to TIME's America's Best Companies 2026, the only PACE org on the list; stated tech-enabled care delivery direction incl. RPM and telehealth | Post-acute care ops. Publicly traded — budget exists, procurement is slower |
| **nVoq** | Boulder | AI clinical documentation for home health / hospice / SNF | MatrixCare EHR integration shipped; Curantis Solutions partnership for hospice and palliative | **Dual-use — see note below** |
| **The Care Team** *(via Revelstoke)* | MI ops, Denver sponsor | Home health & hospice | 2025-12: acquired Traditions Health's hospice and palliative operations in IL, IN, OH and VA, on top of an existing MI/IN/PA footprint — multi-state integration pain. Sponsor is Revelstoke (Denver), whose **Revelstoke Frontier** AI programme launched 2026-06 | Hospice workflow — the HPS lookalike. **Reach it through the sponsor, not the front door** |

**On nVoq.** It is a Boulder company selling ambient AI documentation into precisely
SeeSaw's wedge. Read it two ways and decide before writing: (a) **partner** — they own the
voice layer, SeeSaw owns the workflow and interface around it, and their
MatrixCare/Curantis integrations are exactly the handoff points where product work
appears; (b) **competitor-adjacent** — if a hospice prospect has nVoq, part of the
documentation problem is already taken. It is not a straight ICP account. The partner read
is the better one, and it is a warm, local, low-risk first conversation either way.

### Tier B (6) — nurture

- **DaVita** (Denver) — dialysis. 2026-06: expanded Integrated Kidney Care with AI
  scheduling and care coordination; published work on predictive models for home-dialysis
  attrition. **Flag: far above the revenue band and a public company.** A
  brand/relationship play or a single-team entry, not a pod sale. Denver HQ makes it
  reachable in person, which is the only reason it is listed.
- **Quantum Health / CirrusMD** (CirrusMD Denver; Quantum HQ Ohio) — 2026-03-03
  acquisition, integrating chat-first virtual care into Quantum's agentic AI navigation
  platform. Post-merger integration is real product work; the Denver office and its
  product/engineering staff survive the deal. Decision authority has moved out of state —
  treat the Denver team as the way in, not the buyer.
- **cliexa** (Denver) — digital intake and remote monitoring, bi-directional EMR
  integration. `Est.` ~24 employees (ZoomInfo) — too small for a $45k/mo pod. Best value
  is as a **design partner or co-seller** into their provider and payer base.
- **Guardian Pharmacy of Colorado / of Denver** (Denver, Englewood) — long-term-care
  pharmacy into assisted living and SNF. Medication workflow is the single best proof
  match SeeSaw owns. `(verify)` Guardian Pharmacy Services' current ownership and whether
  Colorado buys technology locally or at the parent — that determines whether this is an
  account or a dead end.
- **Christian Living Communities / Cappella Living Solutions** (Denver) — senior living
  owner-operator plus a third-party management arm running communities in several states.
  No public AI trigger; the multi-state management arm is the interesting surface.
  `(verify)` technology decision-making.
- **Vivage** (Denver) — skilled nursing and long-term care across Colorado and Missouri.
  Post-acute ICP, no dated trigger found. Nurture only.

### Tier C (5) — watch

**The Denver Hospice** (`Est.` $43.3M revenue, RocketReach — nonprofit, likely under
budget, but a genuine HPS-shaped operation) · **Denver Health** (founding member of PACT
AI, 2026-09 — a safety-net system, credibility rather than revenue) · **CU Anschutz
Innovations** (Medtronic strategic research agreement launched 2026-01-22 — see §3, it is
a partner not an account) · **Zynex Medical** (Englewood — medical device, adjacent to the
wedge rather than in it) · **Compassus Colorado** (Denver and Colorado Springs sites;
already Tier A nationally in `03` — the Colorado footprint is an in-person angle on an
existing target, not a new one).

## 3. Colorado referral partners

### The one that matters: Revelstoke Capital Partners (Denver)

Healthcare-focused private equity, `Est.` $6.2B AUM, 30 platform companies and 170
add-ons. In **June 2026 it launched Revelstoke Frontier**, an explicit programme to embed
AI and automation across the firm and its portfolio, staffed with two new hires: **Max
Delahanty**, Director of AI and Data Science, and **Wade Lowder**, Managing Director of
Technology.

This is the highest-leverage door in Colorado, and possibly in either report. It is a
Denver firm with a named, dated, funded AI mandate, and a portfolio sitting squarely in
the wedge — **The Care Team** (hospice/end-of-life), **US Renal Care** (dialysis — already
Tier A in `03`), **AOM Infusion** (specialty infusion), **Claremedica** (Medicare
Advantage), **Fast Pace Health**, **Sound Physicians**, **Encore Rehabilitation**, **Monte
Nido**, **Crossroads**. One relationship reaches a dozen ICP companies whose sponsor has
already decided AI is a value-creation priority.

Delahanty and Lowder are the two most valuable LinkedIn targets in this document. They
were hired to find work like this, they are new enough in seat to still be building a
bench, and Frontier gives an opener that needs no pretext.

### Other sponsors (Denver)

**Bow River Capital** — lower-middle-market, healthcare services and tech-enabled business
services · **Excellere Partners** — `Est.` $2.26B AUM, healthcare and business services ·
**Mountaingate Capital** — LMM business services, healthcare, specialty consumer.
Secondary: **KRG Capital**, **Platte River Equity**, **Millennium Bridge Capital**. None
shows a published AI programme; they rank below Revelstoke on trigger, not on fit.

### Design and data firms (build-handoff referrals)

- **Fuego UX** (Denver/Boulder) — already named in `03` as "the named shape." UX research,
  product strategy, AI design and UI for B2B SaaS and complex software, **with no
  engineering arm**. That is the cleanest two-way referral loop available in Colorado:
  they hit build handoffs constantly and SeeSaw hits research-depth requests. Approach
  first among the design firms.
- **WestLink** (Colorado, founded 2016) — digital product development studio. ⚠ **Likely
  competitive** — they build. `(verify)` scope before treating as a partner.
- **The Creative Alliance**, **Elevated Third** (Denver) — agency-side UX and web.
  `(verify)` whether they hold build capability in-house; only useful as partners if they
  don't.
- **Cloud Data Consulting** (Denver) — Snowflake and data engineering. The BlueYeti
  analogue: they build the pipelines, SeeSaw builds the products on top. `(verify)` size
  and healthcare exposure.

### Ecosystem and community

- **Prime Health** (Denver) — digital health innovation ecosystem, `Est.` 1,200+ members,
  runs Colorado's largest digital health gathering (the Prime Health Innovation Summit)
  with the Governor's Office of eHealth Innovation. Network partners include Denver
  Health, Kaiser Permanente, UCHealth. This is the Colorado equivalent of the Capital
  Factory/TMC slot in `03`: visibility and warm introductions rather than direct deal
  flow. **Highest-value single membership in the state.**
- **CU Anschutz Innovations** (Aurora) — signed a strategic research agreement with
  **Medtronic** launched 2026-01-22 covering AI, robotics, sustainability and advanced
  materials. The TMC Innovation analogue: credibility with Colorado health systems plus
  spinout deal flow.
- **Colorado Technology Association**, **Rockies Venture Club**, **Techstars Boulder** —
  general network, low priority against the four to six opportunities the quarter actually
  needs.

## 4. LinkedIn outreach strategy

### Who to write to

Rank targets by **(ICP tier) × (connection density in product & tech)** — that second term
is what §5 computes. Titles worth the effort, in order:

1. **VP/Head of Product, CPO** — owns the roadmap gap and can name it in one call
2. **CTO, VP Engineering, Chief Digital Officer** — owns the build-vs-buy decision
3. **Chief Clinical Informatics Officer / VP Clinical Informatics** — owns the workflow
   pain and is usually the most under-served by vendors
4. **VP Care Operations, COO** — owns the outcome; slower to engage cold, best via
   referral
5. **Sponsor-side operating partners** (Delahanty, Lowder at Revelstoke) — a category of
   their own

Skip CEOs at anything above `Est.` 200 employees; skip anyone whose title contains
"Growth" or "Innovation" without a delivery mandate.

### Three openers, in priority order

1. **The January date** (§1) — Colorado-only, dated, and specific. Strongest for Tier A
   accounts that have already deployed AI into a decision path: Carina, Colorado Access,
   Strive, SonderMind.
2. **The adjacent unbuilt workflow** — the play that worked in `03`. "You put Innovaccer
   in across 400 sites in March. What's still living in spreadsheets around it?" Works for
   Carina, Colorado Access, and every Revelstoke portfolio company post-Frontier.
3. **The proof point, straight** — "5x faster medication approvals" for anything touching
   pharmacy, prior auth or medication management: Colorado Access, Guardian, the LTC
   pharmacy surface. Do not dress this up; it is the one hard number SeeSaw owns and it
   does the work unassisted.

### Volume discipline

Four to six qualified opportunities per quarter, against a 19-account list, means roughly
**15–25 genuinely warm conversations per quarter** — not 500 connection requests. Being
visibly selective is part of the positioning; a design-led studio that mass-mails
contradicts its own pitch. Two to four new conversations a week, personally written, is
the right shape.

Reuse the machinery that already exists: the `/one-thing` pipeline
(`.claude/skills/one-thing/`) takes a domain and a recipient name/role and produces a
research report, a ≤300-char connection note and a 300–900-char first message, with every
opener traced to a dated, verified source. **Run it per account rather than writing these
by hand.** It already refuses to send without a dated verified opener, which is the exact
failure mode of Colorado-scoped outreach where the local news is thin.

## 5. Next step: mapping this against your connections

You asked to look at LinkedIn programmatically to find where your connections are densest
in product and tech at these companies. Here is what is and isn't possible, plainly.

**Not available:** scraping LinkedIn. It is against their terms and aggressively enforced
against exactly this pattern, and there is no LinkedIn connector in this session. I'm not
going to build that, and an account restriction would cost more than the list is worth.

**Available, and genuinely programmatic — the export path.** LinkedIn will give you your
own data: *Settings → Data Privacy → Get a copy of your data → Connections.* The CSV
arrives in minutes to a day and carries **First Name, Last Name, Company, Position,
Connected On** (email only where the connection allowed it). That is your first-degree
graph, legitimately obtained, and it is enough to do the real work:

- fuzzy-match `Company` against the 19 accounts and the partner list, handling the aliases
  that will otherwise wreck the join (DispatchHealth/Dispatch Health, Colorado Access/CO
  Access, portfolio companies listed under their own names rather than Revelstoke)
- score `Position` against the title ladder in §4
- weight by `Connected On` — a 2015 connection you haven't spoken to since is not a warm
  intro
- output a ranked outreach queue: account, person, title, tier, connection age, suggested
  opener

That's a short script over a CSV. Give me the export and I'll write it and hand you the
ranked list.

**The gap you should know about:** the export is **first-degree only**. It cannot tell you
who at Strive Health is connected to people you know — that is second-degree data and it
is not in any export. Options, in order of cost: a **Sales Navigator** seat (account maps
and lead lists, with CSV export on some tiers) is the real answer if this becomes a
standing motion; failing that, the 19-account list is small enough that checking
second-degree paths by hand on the ones that survive first-degree scoring is maybe an hour
of work.

**What I need from you to run it:** the `Connections.csv` export, and a note on whether
Jeff's connections should be merged in — he owns the relationship half, and for the
sponsor and referral targets in §3 his graph probably matters more than yours.

## 6. Caveats

- **Financial and headcount figures from aggregators** (PitchBook, ZoomInfo, RocketReach)
  are marked `Est.` and are not verified against filings. Do not repeat them to a
  prospect.
- **Everything marked `(verify)`** — Guardian's ownership and buying locus, WestLink's
  competitive overlap, Cappella's and Cloud Data Consulting's decision-making — needs
  confirming before outreach.
- **SB 26-189's scope should get a legal read** before it anchors written outreach at
  volume. Much published commentary still describes the repealed SB 24-205, which was
  significantly broader.
- **Colorado's pharmacy and PBM surface came back thin.** No Colorado-HQ specialty
  pharmacy or PBM with a public AI trigger was found, which is a real gap given that
  pharmacy is SeeSaw's strongest proof point. Guardian is the best available proxy. Worth
  one more manual pass.
- **No stalled-pilot signal.** As in `03`, failed pilots are rarely public. Proxy them by
  flagging the 2025 announcements above that have had no follow-up news by Q1 2027.
- **DataForSEO figures in `02` remain stale** (pulled 2026-07-22). Nothing in this report
  depends on them; any SEO recommendation still does.
