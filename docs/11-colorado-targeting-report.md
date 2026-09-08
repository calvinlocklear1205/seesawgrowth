# Colorado Targeting Report

*Companion to `03-targeting-report.md`, scoped to Colorado-HQ accounts and built for
LinkedIn outreach. Research pulled 2026-09-08 with Firecrawl, Exa, Perplexity and
DataForSEO.*

> **Dependency, flagged once:** Decision #1 (positioning) is still open. This report assumes
> the recommended position — design-led AI product studio with a care-operations wedge,
> healthcare-first in proof rather than healthcare-only in sales. If that call lands
> differently the tiering re-sorts, but the account research holds.

## 0. Method

Same toolchain as `03`, and the tool choice mattered more than usual:

- **Exa** (semantic + `findSimilar`) surfaced operators that keyword search does not
  reach. **Care Synergy** — now a Tier A account and arguably the best hospice target in
  the state — appeared only this way.
- **Firecrawl** read the primary pages rather than trusting search snippets. This produced
  **two corrections that reverse advice**, both in §3: Fuego UX and WestLink.
  Snippet-level research had both wrong.
- **Perplexity** (`sonar-pro`, citation-forced) dated the triggers and caught that the
  Colorado Access × Innovaccer announcement is **2025-06-26**, not 2026.
- **DataForSEO** (Business Listings, Denver 60-mile radius, pulled 2026-09-08) gave
  operator density and a size proxy: **132 hospice, 904 home-health, 64 dialysis**
  listings. It confirmed Colorado footprints for two companies already on the `03` watch
  list.

Nothing here depends on keyword volume, difficulty or CPC. **The DataForSEO keyword
re-pull flagged in `00-status.md` is still outstanding and still blocks SEO spend** — that
is a separate dataset from the business listings used above.

**Why this took two passes.** The first pass ran on general web search because no MCP
servers were configured, even though all four API keys were present in the environment.
`.mcp.json` has been added to the repo root so future sessions get these tools
automatically.

Colorado is a much smaller pond than Texas: 25 accounts are worth naming, not 66. Padding
to match the original's length would be the wrong instinct — at 4–6 qualified
opportunities per quarter, 24 with real triggers is more inventory than the quarter needs.

## 1. The Colorado-specific wedge: SB 26-189

This is the strongest thing in this report and it does not exist in the Texas list.

Colorado's original AI Act (SB 24-205) was never implemented. It was postponed by SB
25B-004 (signed 2025-08-28), then **repealed and replaced by SB 26-189, signed 2026-05-14,
effective 2027-01-01**
([Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-us/knowledge/publications/18733d31/colorado-enacts-revised-ai-law),
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
problem, and it is exactly what a design-led studio sells. It also opens the wider
unbuilt-workflow conversation naturally.

**Two cautions.** Do not overstate the scope: SB 26-189 is materially narrower than the
2024 law, and much published commentary still describes the repealed version. Have counsel
confirm the reading before it anchors written outreach at volume, and never imply SeeSaw
offers a legal opinion.

## 2. Named accounts (25)

Same scoring as `03`: **A** = strong 2025–26 trigger + ICP fit + proof-point match · **B**
= ICP fit with a weaker or inferred trigger · **C** = watch. All HQs in Colorado unless
noted. Revenue and headcount are estimates unless sourced.

### Tier A (10) — approach first

| Company | HQ | Vertical | Trigger (dated) | Maps to |
|---|---|---|---|---|
| **Strive Health** | Denver | Value-based kidney care | $550M Series D ($300M equity + $250M debt); Care Multiplier ML platform; publicly co-developing AI with partner provider groups into 2026 | **Rendevor dialysis analytics** — the closest proof match in the list |
| **Care Synergy** | Denver | Nonprofit post-acute network | **Shared back office across 7 affiliates**: Colorado PACE (Aurora), The Denver Hospice, Pathways Hospice (Fort Collins), Pikes Peak Hospice & Palliative (Colorado Springs), Colorado Visiting Nurse Association, CAPABLE, Superior Medical Equipment. JV with RCC Medical Equipment announced 2024-12-19 | **Hospice workflow — the HPS lookalike, and the best-shaped one in Colorado.** See note |
| **DispatchHealth** | Denver | In-home acute / hospital-at-home | 2026-07-31: refocused on **B2B enablement**, selling CESIA to health systems and risk-bearing providers — a repositioning of the platform as a product for a new buyer | AI product design, HIPAA workflow. `Est.` ~$700M raised, $1.7B valuation (PitchBook) |
| **SonderMind** | Denver | Behavioral health network | Agentic AI referral automation live (admin steps only, no clinical determinations); selected for the **FDA TEMPO pilot** for a smartphone anxiety/depression app | A regulated consumer product needing design, plus 16k+ providers of care-ops surface |
| **Carina Health Network** | Colorado Springs | Nonprofit safety-net network | **2026-03-31:** Innovaccer Healthcare Intelligence Cloud across **1,200+ providers / 400 sites, ~1.5M lives (~40% of state Medicaid)** | Care management. Textbook "bought the platform, owns none of the adjacent workflow" |
| **Colorado Access** | Denver *(see note)* | Nonprofit Medicaid health plan | **2025-06-26:** Innovaccer partnership (530k+ Medicaid members); separate Vital Data Technology quality partnership; **CMS Interoperability & Prior Auth reporting lands 2026** | **Pharmacy/prior-auth workflow — the HPS "5x faster medication approvals" proof** |
| **Swisslog Healthcare** | Broomfield | Pharmacy & medication-management automation | US HQ in Broomfield; self-described global leader in medication management. **2025-09-15:** strategic alliance with Diligent Robotics for autonomous hospital delivery robots | **Medication workflow.** Dual-use — see note |
| **InnovAge** | Denver | PACE (all-inclusive elderly care) | Named to TIME's America's Best Companies 2026, the only PACE org listed; stated tech-enabled care direction incl. RPM and telehealth | Post-acute care ops. Publicly traded — budget exists, procurement is slower |
| **nVoq** | Boulder | AI clinical documentation for home health / hospice / SNF | MatrixCare EHR integration shipped; Curantis Solutions partnership for hospice and palliative | Dual-use — see note |
| **The Care Team** *(via Revelstoke)* | MI ops, Denver sponsor | Home health & hospice | **2025-12:** acquired Traditions Health's hospice and palliative operations in IL, IN, OH and VA on top of an existing MI/IN/PA footprint — multi-state integration pain. Sponsor is Revelstoke (Denver), whose **Revelstoke Frontier** AI programme launched 2026-06 | Hospice workflow. **Reach it through the sponsor, not the front door** |

**On Care Synergy — read this before anything else in the table.** It is a Denver
501(c)(3) whose stated purpose is providing **back-office services to independent
nonprofit hospice, home-health and palliative affiliates**. That structure is unusually
good for SeeSaw: technology decisions are centralised in one small organisation, but the
workflow pain is spread across seven operating agencies including two of Colorado's
largest hospices and a PACE programme. One engagement reaches all of them, the buyer is
reachable, and nonprofit shared-services groups are chronically under-served by product
teams. The obvious constraint is budget — nonprofit back-office, not PE-backed — so
qualify hard on that before investing in the pursuit.

**On Colorado Access's HQ.** Their own contact page lists **4643 S Ulster St, Denver**; CB
Insights, ZoomInfo and the Aurora Chamber still list 11100 E Bethany Dr, **Aurora**. Use
Denver, and don't lead a message with either address.

**On the two dual-use accounts, nVoq and Swisslog.** Both are Colorado companies selling
*into* SeeSaw's wedge rather than sitting in it. Read each two ways before writing.
**Partner:** they own a layer (voice capture; pharmacy automation hardware and software)
and SeeSaw owns the workflow and interface around it — nVoq's MatrixCare and Curantis
integrations, and Swisslog's hospital pharmacy deployments, are exactly the handoff points
where product work appears. **Competitor-adjacent:** if a hospice prospect already runs
nVoq, part of the documentation problem is taken. Neither is a straight ICP account; the
partner read is better for both. Swisslog carries one extra caution — it is the US arm of
a global group, so product decisions may not sit in Broomfield. `(verify)` where its
software roadmap is actually owned before investing in the pursuit.

### Tier B (9) — nurture

- **UCHealth** (Aurora) — **2026-02-24:** expanded its Abridge partnership to scale
  ambient AI documentation across **2,300+ clinical locations**. The largest named AI
  scale-out in Colorado. **Flag: a major nonprofit health system, far above the revenue
  band.** Realistically a credibility and relationship target, or a single-department
  entry, not a pod sale.
- **DaVita** (Denver) — dialysis. 2026-06: expanded Integrated Kidney Care with AI
  scheduling and care coordination; published work on predictive models for home-dialysis
  attrition. **Flag: far above the band, public company.** Denver HQ makes it reachable in
  person, which is the only reason it is listed.
- **Quantum Health / CirrusMD** (CirrusMD Denver; Quantum HQ Ohio) — 2026-03-03
  acquisition, integrating chat-first virtual care into Quantum's agentic AI navigation
  platform. Post-merger integration is real product work and the Denver
  product/engineering team survives the deal, but decision authority moved out of state.
  Treat the Denver team as the way in, not the buyer.
- **Bristol Hospice — Denver & Northern Colorado** (Greenwood Village, Frederick) —
  **already Tier C in `03`** as a Webster Equity portfolio company. DataForSEO confirms
  two substantial Colorado locations (2026-09-08). The Colorado footprint is a local,
  in-person angle on an existing watch-list name — `03` notes Webster shows no AI
  programme, so the sponsor door stays cold.
- **Innovative Renal Care — Colorado** (Frederick, Longmont, Lakewood) — **already Tier C
  in `03`**. Same logic: confirmed Colorado dialysis clinics give a local angle on a
  national watch-list account. Maps to the Rendevor proof.
- **Grit Digital Health** (Denver) — behavioral health and wellbeing product company spun
  out of Cactus, with shipped products (Man Therapy, YOU at College, Nod, Operation
  Veteran Strong). Design-and-technology positioning close to SeeSaw's own. `Est.` small,
  so unlikely to buy a pod — value is as a **design partner, co-seller or
  acquisition-adjacent relationship** in behavioral health, and as the clearest read on
  how Cactus behaves in product.
- **cliexa** (Denver) — digital intake and remote monitoring, bi-directional EMR
  integration. `Est.` ~24 employees (ZoomInfo) — too small for a $45k/mo pod. Best value
  is as a **design partner or co-seller** into their provider and payer base.
- **Christian Living Communities / Cappella Living Solutions** (Denver) — senior living
  owner-operator plus a third-party management arm running communities in several states.
  No public AI trigger; the multi-state management arm is the interesting surface.
  `(verify)` technology decision-making.
- **Vivage** (Denver) — skilled nursing and long-term care across Colorado and Missouri.
  Post-acute ICP, no dated trigger found. Nurture only.

### Tier C (6) — watch

**Guardian Pharmacy of Colorado / of Denver** (Denver, Englewood) — long-term-care
pharmacy into assisted living and SNF, and on paper the best proof match SeeSaw owns.
**Downgraded on evidence:** the parent, Guardian Pharmacy Services, is **publicly traded
(NYSE: GRDN)** and Atlanta-based, so technology buying is almost certainly centralised at
the parent rather than in Denver. Pursue the parent or not at all — do not work the
Colorado units. · **Denver Health** (founding member of PACT AI, 2026-09 — safety-net
system; credibility, not revenue) · **CU Anschutz Innovations** (Medtronic strategic
research agreement launched 2026-01-22 — see §3, a partner not an account) · **Zynex
Medical** (Englewood — medical device, adjacent to the wedge rather than in it) ·
**Compassus Colorado** (Denver and Colorado Springs sites; already Tier A nationally in
`03` — an in-person angle on an existing target, not a new one) · **The independent
operator long tail** (PASCO, Namaste Health, DignityFirst, Elevation Hospice and ~130
other Denver-area hospice listings) — mostly under budget individually; interesting only
if a roll-up buys several.

## 3. Colorado referral partners

### The one that matters: Revelstoke Capital Partners (Denver)

Healthcare-focused private equity, `Est.` $6.2B AUM, 30 platform companies and 170
add-ons. In **June 2026 it launched Revelstoke Frontier**, an explicit programme to embed
AI and automation across the firm and its portfolio, staffed with two new hires: **Max
Delahanty**, Director of AI and Data Science, and **Wade Lowder**, Managing Director of
Technology.

This is the highest-leverage door in Colorado, and possibly in either report. A Denver
firm with a named, dated, funded AI mandate and a portfolio sitting squarely in the wedge
— **The Care Team** (hospice), **US Renal Care** (dialysis — already Tier A in `03`),
**AOM Infusion** (specialty infusion), **Claremedica** (Medicare Advantage), **Fast Pace
Health**, **Sound Physicians**, **Encore Rehabilitation**, **Monte Nido**, **Crossroads**.
One relationship reaches a dozen ICP companies whose sponsor has already decided AI is a
value-creation priority.

Delahanty and Lowder are the two most valuable LinkedIn targets in this document. They
were hired to find work like this, they are new enough in seat to still be building a
bench, and Frontier gives an opener that needs no pretext.

### Other sponsors (Denver)

**Bow River Capital** — lower-middle-market, healthcare services and tech-enabled business
services · **Excellere Partners** — `Est.` $2.26B AUM, healthcare and business services ·
**Mountaingate Capital** — LMM business services, healthcare, specialty consumer.
Secondary: **KRG Capital**, **Platte River Equity**, **Millennium Bridge Capital**. None
shows a published AI programme; they rank below Revelstoke on trigger, not on fit.

### Design and build firms — two corrections

**Both of these reverse what snippet-level research suggested. Read before approaching
either.**

- **Fuego UX** (Denver/Boulder) — ⚠ **not a design-only firm, and `03` §2 is now stale on
  this point.** Their services page reads "We research, design, **and build** what
  matters," with an explicit *Develop* line ("from concept to production"). `03` lists
  them under design/UX-only studios as "the named shape," and the earlier draft of this
  report called them the cleanest two-way referral loop in Colorado. That is wrong as of
  2026-09-08. They are a **competitor with overlapping positioning** — research-led,
  AI-design-forward, B2B SaaS and complex software. Treat as competitive intelligence, or
  approach with the conflict named explicitly. Do not pitch a referral partnership cold.
- **WestLink** (Colorado, since 2016) — ⚠ **confirmed competitive.** Homepage: "We build
  the software that does. For 100+ companies since 2016," with Uber, Bose, Volcom, Citizen
  and Rolling Stone as logos. A build firm, not a partner.
- **The Creative Alliance**, **Elevated Third** (Denver) — agency-side UX and web.
  `(verify)` whether they hold build capability in-house; only useful as partners if they
  don't. Given the two corrections above, verify by reading the services page, not a
  directory listing.
- **SAGE Research + Design** — medical human factors and risk-management consulting, FDA
  and MDR submission support. The one design-side candidate that passed the services-page
  test: regulated-device research with no build arm. The Bold Insight analogue from `03`,
  and the best design-partner prospect found in this pass. `(verify)` Colorado presence
  and size.
- **Humanice Research + Design** (`hmnx.co`) — human-centred design research, no
  build-signal language anywhere on the site. Passed the test but appears very small.
  `(verify)` whether there is enough there to be a channel.
- **Checked and rejected as build-handoff partners:** MATTER (Denver — graphic design and
  typography, not product), Weav Studio (Denver — cooperative strategy and equity
  consulting, not product), The Creative Alliance (see above).
- **Cloud Data Consulting** (Denver) — Snowflake and data engineering. The BlueYeti
  analogue: they build pipelines, SeeSaw builds the products on top. `(verify)` size and
  healthcare exposure.

**The lesson worth carrying into the monthly playbook:** Colorado's design-and-build
market has consolidated toward full-service. Assume a Colorado studio builds unless its
own services page says otherwise, and verify every design-partner candidate by reading
that page.

### Marketing and brand agencies — mostly a trap, with one exception

The build-partner-to-an-agency play is a real channel, but it is the wrong one here, and
it is worth saying why rather than quietly leaving them off the list.

**The budget is the wrong budget.** A brand or campaign agency's build handoffs are
microsites, campaign landing pages and brand sites, paid out of a marketing budget at
`Est.` $15–40k a piece, one-off. That is precisely the "absorbing endless small jobs"
failure mode named in `00-status.md` as a thing SeeSaw is actively trying to do less of.
Filling capacity with agency overflow is the opposite of 3 pods at $45k/mo, and the
opportunity cost is the pursuit time it takes from §2. It also cuts against the
positioning: a design-led AI product studio that subcontracts campaign builds trains the
market to see it as an execution vendor.

**The buyer is the wrong buyer.** These agencies sell to CMOs. The accounts in §2 are
bought by product, technology, clinical informatics and care operations. A referral from a
CMO's agency lands in the wrong org and has to be re-sold internally.

**The exception worth one call: Cactus** (Denver). Genuine healthcare depth rather than a
healthcare page — a distinct Cactus Health practice, MM&M Agency 100 listings in 2024 and
2025, and real behavioral and mental-health work. But note what that depth produced: they
created **Grit Digital Health**, a product company with shipped apps. So Cactus is not a
design-only firm looking for an engineering partner; it has product capability and is
**partly competitive**. Approach it as a peer and possible co-seller on healthcare
pursuits too big for either firm alone, not as a referral source expecting handoffs — and
name the overlap rather than discovering it in month three.

**Karsh Hagan, Psyche Digital and the rest of the Denver agency set** are general brand
and campaign shops without a specific healthcare practice. `(verify)` if one of them turns
out to hold a large health-system account, but do not work the category on spec. The
Colorado-specific healthcare marketing shops Exa surfaced — A-Train, Armada Medical, EOS
Healthcare Marketing, Clyck — are small and provider-marketing focused; their clients buy
patient acquisition, not care-operations software.

### The better version of that idea: platform partner programmes

This is the category to add instead, and it is stronger than the agency play on every
axis.

The platforms already deployed inside the Tier A accounts run formal partner programmes,
and their implementation ecosystems have exact buyer overlap with SeeSaw and no build
conflict — they configure and deploy, they do not build product.

- **Innovaccer** is live at **both Carina Health Network** (1,200+ providers, 400 sites)
  and **Colorado Access** (530k+ members). Its partner programme, built around the
  *Gravity* platform, explicitly advertises "rapid prototyping to production" and — the
  interesting part — **"monetise IP via marketplace,"** packaging a partner's proprietary
  models and workflows for recurring revenue. That is not a referral channel, it is a
  **product distribution channel**, and it maps directly onto the standing goal of
  diversifying into owned SaaS rather than only selling pods.
- **MatrixCare** is the post-acute EHR under most of the hospice and home-health surface
  in §2, and runs a partner marketplace of integrated solutions. **nVoq already sits in
  it** — which is the cleanest available illustration of the shape: a Colorado company
  monetising a workflow layer on top of the EHR the operators already run.
- **Epic** implementation consultancies serving Colorado health systems are the third leg,
  though the buyer is further from the wedge and the firms are mostly national.

**Why this beats the agency channel:** the buyer overlap is exact rather than adjacent,
the firms cannot compete on build, the platform vendor has a commercial interest in a
partner filling gaps it will not build itself, and a marketplace listing is a durable
asset rather than a one-off referral. `(verify)` the specific Rocky Mountain
implementation partners for each platform — the vendor partner directories are the place
to start, and that verification is the first concrete task in this category.

### Ecosystem and community

- **Prime Health** (Denver) — digital health innovation ecosystem, `Est.` 1,200+ members,
  runs Colorado's largest digital health gathering (the Prime Health Innovation Summit)
  with the Governor's Office of eHealth Innovation. Network partners include Denver
  Health, Kaiser Permanente and UCHealth. The Colorado equivalent of the Capital
  Factory/TMC slot in `03`: visibility and warm introductions rather than direct deal
  flow. **Highest-value single membership in the state.**
- **CU Anschutz Innovations** (Aurora) — strategic research agreement with **Medtronic**
  launched 2026-01-22 covering AI, robotics, sustainability and advanced materials. The
  TMC Innovation analogue: credibility with Colorado health systems plus spinout deal
  flow.
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
"Growth" or "Innovation" without a delivery mandate. At Care Synergy, target the
shared-services organisation rather than the individual affiliates.

### Three openers, in priority order

1. **The January date** (§1) — Colorado-only, dated, specific. Strongest for Tier A
   accounts that have already deployed AI into a decision path: Carina, Colorado Access,
   Strive, SonderMind.
2. **The adjacent unbuilt workflow** — the play that worked in `03`. "You put Innovaccer
   in across 400 sites in March. What's still living in spreadsheets around it?" Works for
   Carina, Colorado Access, and every Revelstoke portfolio company post-Frontier.
3. **The proof point, straight** — "5x faster medication approvals" for anything touching
   pharmacy, prior auth or medication management: Colorado Access, Swisslog, the LTC
   pharmacy surface. Do not dress this up; it is the one hard number SeeSaw owns and it
   does the work unassisted.

### Volume discipline

Four to six qualified opportunities per quarter, against a 25-account list, means roughly
**15–25 genuinely warm conversations per quarter** — not 500 connection requests. Being
visibly selective is part of the positioning; a design-led studio that mass-mails
contradicts its own pitch. Two to four new conversations a week, personally written, is
the right shape.

Reuse the machinery that already exists: the `/one-thing` pipeline
(`.claude/skills/one-thing/`) takes a domain and a recipient name and role and produces a
research report, a ≤300-char connection note and a 300–900-char first message, with every
opener traced to a dated verified source. **Run it per account rather than writing these
by hand.** It already refuses to send without a dated verified opener, which is the exact
failure mode of Colorado-scoped outreach where the local news is thin.

## 5. Next step: mapping this against your connections

You asked to look at LinkedIn programmatically to find where your connections are densest
in product and tech at these companies. What is and isn't possible, plainly.

**Not available:** scraping LinkedIn. It is against their terms and aggressively enforced
against exactly this pattern, and no amount of tooling changes that. An account
restriction would cost more than the list is worth.

**Available, and genuinely programmatic — the export path.** LinkedIn will give you your
own data: *Settings → Data Privacy → Get a copy of your data → Connections.* The CSV
arrives in minutes to a day and carries **First Name, Last Name, Company, Position,
Connected On** (email only where the connection allowed it). That is your first-degree
graph, legitimately obtained, and it is enough to do the real work:

- fuzzy-match `Company` against the 25 accounts and the partner list, handling the aliases
  that will otherwise wreck the join (DispatchHealth/Dispatch Health; Care Synergy vs. its
  seven affiliate names; Revelstoke portfolio companies listed under their own names)
- score `Position` against the title ladder in §4
- weight by `Connected On` — a 2015 connection you haven't spoken to since is not a warm
  intro
- output a ranked queue: account, person, title, tier, connection age, suggested opener

That is a short script over a CSV. Send the export and I will write it and hand back the
ranked list.

**The gap you should know about:** the export is **first-degree only**. It cannot tell you
who at Strive Health is connected to people you know — that is second-degree data and it
is not in any export. Options, in order of cost: a **Sales Navigator** seat (account maps
and lead lists, with CSV export on some tiers) is the real answer if this becomes a
standing motion; failing that, 25 accounts is small enough to check second-degree paths by
hand on the ones that survive first-degree scoring — roughly an hour.

**What I need from you:** the `Connections.csv`, and a note on whether Jeff's connections
should be merged in. He owns the relationship half, and for the sponsor and referral
targets in §3 his graph probably matters more than yours.

## 6. Caveats

- **Aggregator figures** (PitchBook, ZoomInfo, RocketReach) are marked `Est.` and are not
  verified against filings. Do not repeat them to a prospect.
- **Still marked `(verify)`:** where Swisslog's software roadmap is owned, Cappella's
  technology decision-making, Cloud Data Consulting's size and healthcare exposure, and
  whether The Creative Alliance or Elevated Third build in-house.
- **`03` §2 is stale on Fuego UX** — it lists them as a design/UX-only studio and they now
  advertise development. Worth a correction pass on `03`'s design-partner list generally,
  since the same drift may affect the Texas names.
- **SB 26-189's scope should get a legal read** before it anchors written outreach at
  volume. Much published commentary still describes the repealed SB 24-205, which was
  significantly broader.
- **No stalled-pilot signal.** As in `03`, failed pilots are rarely public. Proxy them by
  flagging the 2025 announcements above that have had no follow-up news by Q1 2027.
- **DataForSEO keyword figures in `02` remain stale** (pulled 2026-07-22). The
  business-listing data used in §0 is fresh as of 2026-09-08; the keyword dataset is a
  different pull and still blocks SEO spend.
