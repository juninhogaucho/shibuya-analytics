export type ShibuyaActorStoryId =
  | 'retail_trader'
  | 'prop_trader'
  | 'broker_trader'
  | 'prop_firm'
  | 'broker'
  | 'tech_provider'
  | 'growth_agency'
  | 'quant_research_partner'
  | 'clinical_research_partner'

export type ShibuyaActorSurface = 'story' | 'solutions' | 'partners' | 'private_scope'

export type ShibuyaActorOwner =
  | 'shibuya_b2c'
  | 'shibuya_b2b_distribution'
  | 'decrypt_propos_handoff'
  | 'research_scope'

export interface ShibuyaActorStory {
  id: ShibuyaActorStoryId
  label: string
  audienceLabel: string
  surfaces: ShibuyaActorSurface[]
  owner: ShibuyaActorOwner
  headline: string
  theirQuestion: string
  storyBeats: [string, string, string]
  whatShibuyaCanDo: string[]
  whatTheyGiveUs: string[]
  whatTheyPayFor: string[]
  deliveryProof: string[]
  truthBoundary: string
  cannotClaim: string[]
}

export const SHIBUYA_ACTOR_STORIES: ShibuyaActorStory[] = [
  {
    id: 'retail_trader',
    label: 'Retail trader',
    audienceLabel: 'B2C / direct trader',
    surfaces: ['story', 'solutions'],
    owner: 'shibuya_b2c',
    headline: 'Find out whether the leak is edge, behavior, or the state you keep entering.',
    theirQuestion: 'What can Shibuya do for me before I risk another session?',
    storyBeats: [
      'The trader recognizes a possible state in the public story.',
      'Upload turns that recognition into a backend teaser or a clearly marked sample packet.',
      'Live activation, first upload, and append history decide whether the pattern is real.',
    ],
    whatShibuyaCanDo: [
      'Turn broker or platform history into an evidence packet instead of another generic journal.',
      'Separate edge quality, process cost, repeat mistakes, and next-session constraints.',
      'Keep the loop alive through append proof so progress is not declared after one report.',
    ],
    whatTheyGiveUs: [
      'A CSV, statement export, paste, or connector path when available.',
      'Trader context such as market, instrument mix, capital pressure, and current goal.',
      'Repeat uploads when they want Shibuya to confirm improvement or relapse.',
    ],
    whatTheyPayFor: [
      'Live workspace access.',
      'Reset Pro continuity when the trader needs a stronger intervention loop.',
      'Guided review only when the plan includes human review.',
    ],
    deliveryProof: [
      'Verified activation.',
      'First meaningful upload with generated backend artifacts.',
      'Append history proving whether the next sessions changed.',
    ],
    truthBoundary:
      'The public story can recognize a possible state. Account-specific truth begins only after upload, generated artifacts, and append proof.',
    cannotClaim: [
      'No guaranteed profit improvement.',
      'No instrument-level buy, sell, hold, or avoid call.',
      'No private diagnosis from a URL, sample workspace, or public click path.',
    ],
  },
  {
    id: 'prop_trader',
    label: 'Prop trader',
    audienceLabel: 'B2B2C / trader inside a prop context',
    surfaces: ['solutions', 'partners'],
    owner: 'shibuya_b2b_distribution',
    headline: 'Make rule pressure and evaluation behavior visible without making the firm the whole identity.',
    theirQuestion: 'What can Shibuya do for a trader trying to pass, keep, or recover an account?',
    storyBeats: [
      'The trader arrives with challenge, drawdown, or funded-account pressure.',
      'Shibuya asks whether the account behavior changes near rules, losses, or payout pressure.',
      'The live workspace keeps the answer portable even if the trader changes firm later.',
    ],
    whatShibuyaCanDo: [
      'Show how rule pressure, drawdown lines, resets, and payout moments change behavior.',
      'Translate prop context into next-session constraints without pretending the firm endorsed the analysis.',
      'Carry the trader story into firm-supported access when a partner buys distribution.',
    ],
    whatTheyGiveUs: [
      'Trade history plus the relevant prop rule context.',
      'Account phase context: challenge, funded, reset, breach recovery, or payout review.',
      'Repeat evidence after the next session.',
    ],
    whatTheyPayFor: [
      'Direct trader access, firm-supported access, or a bundled partner offer.',
      'Reset Pro when the trader needs a structured intervention loop.',
    ],
    deliveryProof: [
      'Rule context captured before private claims.',
      'Upload artifacts tied to the activated trader account.',
      'Append packets showing whether pressure behavior changed.',
    ],
    truthBoundary:
      'A prop trader story can name rule pressure. It cannot imply a firm partnership, account guarantee, or payout outcome without the firm contract and backend evidence.',
    cannotClaim: [
      'No claim that Shibuya can make a trader pass.',
      'No claim that a specific prop firm approved the route unless a signed relationship exists.',
      'No fake funded-account or payout proof.',
    ],
  },
  {
    id: 'broker_trader',
    label: 'Broker trader',
    audienceLabel: 'B2B2C / trader inside a broker context',
    surfaces: ['solutions', 'partners'],
    owner: 'shibuya_b2b_distribution',
    headline: 'Help the trader understand behavior, retention risk, and account development without becoming brokerage advice.',
    theirQuestion: 'What can Shibuya do for a trader whose account lives with a broker?',
    storyBeats: [
      'The trader needs to know whether behavior, product choice, or process is driving account damage.',
      'Shibuya turns account history into state, leak, and next-session context.',
      'The broker-supported route can improve education and retention while keeping trade advice out of scope.',
    ],
    whatShibuyaCanDo: [
      'Explain repeat behavior and account-development signals from trading history.',
      'Help the trader see process cost without telling them what instrument to trade.',
      'Support broker distribution when the broker provides a clean ingestion path.',
    ],
    whatTheyGiveUs: [
      'Broker export, statement, or connector access where approved.',
      'Account context such as product set, leverage, region, and trading frequency.',
      'Consent and data-processing path when the broker supports the account.',
    ],
    whatTheyPayFor: [
      'Direct trader subscription or broker-supported trader access.',
      'Optional guided review only when explicitly sold.',
    ],
    deliveryProof: [
      'Verified account activation.',
      'Normalized history tied to the account.',
      'Append proof that compares later sessions against the mandate.',
    ],
    truthBoundary:
      'Broker-supported Shibuya is education and behavior intelligence. It is not investment advice, execution advice, or a broker recommendation engine.',
    cannotClaim: [
      'No trade recommendation.',
      'No suitability decision.',
      'No broker endorsement unless the broker relationship exists.',
    ],
  },
  {
    id: 'prop_firm',
    label: 'Prop firm',
    audienceLabel: 'B2B / firm buyer',
    surfaces: ['partners'],
    owner: 'shibuya_b2b_distribution',
    headline: 'Understand which traders have real edge, expensive behavior, and recoverable intervention moments.',
    theirQuestion: 'What can Shibuya do for our firm and for our traders?',
    storyBeats: [
      'The firm wants more than another challenge portal or static risk rule.',
      'Shibuya measures trader behavior, retention, reset, abuse, and intervention quality as an intelligence layer.',
      'The firm pays for access, distribution, or verified value added only after scope and proof rules are defined.',
    ],
    whatShibuyaCanDo: [
      'Give traders a product they can actually use after purchase or reset.',
      'Surface cohort, risk, abuse, retention, and intervention signals for operators.',
      'Route full operating-system needs to Decrypt or PropOS when the firm needs more than Shibuya intelligence.',
    ],
    whatTheyGiveUs: [
      'Cohort definition, rulebook context, export/API path, and decision-maker access.',
      'Clear commercial owner and support responsibilities.',
      'Baseline and attribution inputs if TVA is part of the deal.',
    ],
    whatTheyPayFor: [
      'Per account, funded account, challenge, or trader-month access.',
      'Optional operator intelligence surfaces.',
      'Optional TVA success share above an agreed floor.',
    ],
    deliveryProof: [
      'Signed scope and data-processing path.',
      'Pilot cohort with baseline definitions.',
      'Reconciliation ledger before any uplift claim.',
    ],
    truthBoundary:
      'Shibuya can be sold to prop firms as trader intelligence. Full tenant portals, payout ops, and prop operating systems belong to Decrypt or PropOS scope.',
    cannotClaim: [
      'No proven pass-rate uplift before a measured cohort exists.',
      'No reduced fraud claim without a baseline and audit trail.',
      'No claim that Shibuya replaces the firm stack by default.',
    ],
  },
  {
    id: 'broker',
    label: 'Broker',
    audienceLabel: 'B2B / broker buyer',
    surfaces: ['partners'],
    owner: 'shibuya_b2b_distribution',
    headline: 'Turn trading history into education, retention, and account-development intelligence without pretending to control execution.',
    theirQuestion: 'What can Shibuya do for our brokerage and for our traders?',
    storyBeats: [
      'The broker owns trader access, platform data, and account lifecycle context.',
      'Shibuya turns that context into trader-facing guidance and operator-facing intelligence.',
      'The broker pays for deployment only against defined access, support, data, and compliance boundaries.',
    ],
    whatShibuyaCanDo: [
      'Provide trader-facing behavior intelligence that supports education and retention.',
      'Expose account-development and cohort signals for broker teams.',
      'Adapt to broker constraints without crossing into execution advice.',
    ],
    whatTheyGiveUs: [
      'Approved export, API, or embedded data path.',
      'Compliance constraints, product scope, and support ownership.',
      'Pilot cohort and baseline definitions.',
    ],
    whatTheyPayFor: [
      'Trader access, embedded surfaces, or operator intelligence.',
      'Implementation support if integration is deeper than universal ingestion.',
      'Optional value-based overlay only when measurement rules are agreed.',
    ],
    deliveryProof: [
      'Data path and permission proof.',
      'Activated trader cohort.',
      'Measured retention, support, or engagement deltas only after baseline.',
    ],
    truthBoundary:
      'Broker value must stay inside education, behavior intelligence, retention, and account-development support. Shibuya does not become a broker or adviser.',
    cannotClaim: [
      'No suitability or trading recommendation.',
      'No guaranteed retention lift.',
      'No claim of broker production integration before the connector exists.',
    ],
  },
  {
    id: 'tech_provider',
    label: 'Tech provider',
    audienceLabel: 'B2B / distribution partner',
    surfaces: ['partners'],
    owner: 'shibuya_b2b_distribution',
    headline: 'Keep your infrastructure. Add Shibuya as the intelligence layer your customers can resell or embed.',
    theirQuestion: 'What can Shibuya add to our installed base without asking us to rebuild everything?',
    storyBeats: [
      'The provider already owns reach and infrastructure.',
      'Shibuya gives that infrastructure a trader-intelligence layer instead of another generic portal.',
      'Revenue share pays for distribution; TVA pays only for measured incremental value.',
    ],
    whatShibuyaCanDo: [
      'Create a sell-through trader intelligence offer for customers already on the provider stack.',
      'Add operator intelligence when the provider wants firm-side value.',
      'Hand off full operating-system replacement cases to Decrypt or PropOS.',
    ],
    whatTheyGiveUs: [
      'Usable data path, export format, or connector access.',
      'Customer introductions or a real pilot cohort.',
      'Commercial owner, billing/support split, and data responsibilities.',
    ],
    whatTheyPayFor: [
      'Wholesale, revenue-share, or embedded trader-intelligence economics.',
      'Operator-intelligence floor if firm-side surfaces are included.',
      'Optional TVA share only when baseline and attribution are agreed.',
    ],
    deliveryProof: [
      'One real data path.',
      'One real pilot cohort or design-partner firm.',
      'One commercial model that can repeat across their installed base.',
    ],
    truthBoundary:
      'A tech-provider story is not a replacement pitch by default. Shibuya makes their stack more valuable first.',
    cannotClaim: [
      'No vague partnership language without data access.',
      'No customer-base claim without introductions or signed distribution.',
      'No "we replace your stack" unless replacement is the actual scope.',
    ],
  },
  {
    id: 'growth_agency',
    label: 'Growth or email agency',
    audienceLabel: 'B2B / acquisition partner',
    surfaces: ['partners'],
    owner: 'shibuya_b2b_distribution',
    headline: 'Use truthful trader stories to create demand without inventing proof or partnerships.',
    theirQuestion: 'What can Shibuya give our campaigns that competitors cannot copy in one landing page?',
    storyBeats: [
      'The agency needs a sharp offer that does not rely on fake metrics.',
      'Shibuya supplies actor-specific stories, proof boundaries, and paid handoff contracts.',
      'The agency earns when tracked distribution produces real qualified activation, not vanity attention.',
    ],
    whatShibuyaCanDo: [
      'Provide campaign-ready actor stories with claim boundaries.',
      'Give agencies differentiated angles for traders, props, brokers, and tech providers.',
      'Measure referral and conversion paths without pretending marketing signals are trader proof.',
    ],
    whatTheyGiveUs: [
      'Audience list, consent path, campaign plan, and attribution setup.',
      'Clear approval process for public claims.',
      'Performance reporting that separates clicks, activation, upload, and retention.',
    ],
    whatTheyPayFor: [
      'Campaign fee, affiliate share, or distribution revenue share.',
      'Optional success economics only on agreed tracked outcomes.',
    ],
    deliveryProof: [
      'Tracked campaign source and referral code.',
      'Activation and upload funnel evidence.',
      'No public performance claim until outcomes reconcile.',
    ],
    truthBoundary:
      'Marketing can sell the story. It cannot promote invented metrics, invented partnerships, or account-specific outcomes.',
    cannotClaim: [
      'No fake testimonials.',
      'No invented partnerships.',
      'No uplift percentage before a measured cohort exists.',
    ],
  },
  {
    id: 'quant_research_partner',
    label: 'Quant or data research partner',
    audienceLabel: 'Research / methodology partner',
    surfaces: ['partners', 'private_scope'],
    owner: 'research_scope',
    headline: 'Stress-test the math, assumptions, and model cards before broader claims scale.',
    theirQuestion: 'What can we help Shibuya prove, falsify, or improve?',
    storyBeats: [
      'The partner brings model rigor, data, or independent review capacity.',
      'Shibuya brings behavioral hypotheses, trade-history transformations, and product questions.',
      'The collaboration produces validation artifacts before any public methodology claim expands.',
    ],
    whatShibuyaCanDo: [
      'Expose model assumptions and behavioral hypotheses for review.',
      'Run controlled validation work against agreed data and evaluation criteria.',
      'Turn validated findings into product-safe model cards and proof artifacts.',
    ],
    whatTheyGiveUs: [
      'Methodology review, anonymized data, or controlled research time.',
      'Critical feedback on metrics, leakage, bias, and robustness.',
      'Agreement on what can be published or used commercially.',
    ],
    whatTheyPayFor: [
      'Paid research scope, data partnership, or joint validation project.',
      'No equity, endorsement, or public logo unless separately agreed.',
    ],
    deliveryProof: [
      'Signed research scope.',
      'Evaluation protocol.',
      'Validation artifact or model card before external claims.',
    ],
    truthBoundary:
      'Research interest is not validation. Validation exists only when the agreed protocol, data, and artifact are complete.',
    cannotClaim: [
      'No external validation claim from a dinner, call, or informal review.',
      'No logo or endorsement without permission.',
      'No model performance claim without a model card or validation report.',
    ],
  },
  {
    id: 'clinical_research_partner',
    label: 'Clinical or human-state research partner',
    audienceLabel: 'Research / sleep and behavior partner',
    surfaces: ['partners', 'private_scope'],
    owner: 'research_scope',
    headline: 'Study trader state, sleep, circadian context, and behavior without making medical claims.',
    theirQuestion: 'What can Shibuya study with us, and what must stay out of public claims?',
    storyBeats: [
      'The partner understands sleep, human state, clinical workflow, or research design.',
      'Shibuya supplies trader behavior questions and trade-history outcome context.',
      'The work stays non-medical unless a proper protocol, consent path, and review process exist.',
    ],
    whatShibuyaCanDo: [
      'Frame trader-state research questions around behavior, context, and outcomes.',
      'Help design evidence collection that can later inform product safely.',
      'Keep medical, diagnostic, and treatment claims out of product copy.',
    ],
    whatTheyGiveUs: [
      'Research protocol, consent design, and domain review.',
      'Approved study population or data path if available.',
      'Clear rules for what can be published or commercialized.',
    ],
    whatTheyPayFor: [
      'Research engagement, study scope, or sponsored analysis.',
      'No public clinic endorsement unless explicitly signed.',
    ],
    deliveryProof: [
      'Approved protocol and consent path.',
      'Data-processing and privacy proof.',
      'Research artifact before product or marketing claims.',
    ],
    truthBoundary:
      'This is human-state research, not medical advice, diagnosis, treatment, or sleep-clinic endorsement.',
    cannotClaim: [
      'No medical outcome claim.',
      'No diagnosis or treatment guidance.',
      'No clinic, spouse, or researcher endorsement unless signed.',
    ],
  },
]

export function getActorStoriesForSurface(surface: ShibuyaActorSurface): ShibuyaActorStory[] {
  return SHIBUYA_ACTOR_STORIES.filter((story) => story.surfaces.includes(surface))
}

export function getActorStoriesById(ids: ShibuyaActorStoryId[]): ShibuyaActorStory[] {
  const storyById = new Map(SHIBUYA_ACTOR_STORIES.map((story) => [story.id, story]))

  return ids.map((id) => {
    const story = storyById.get(id)
    if (!story) {
      throw new Error(`Unknown Shibuya actor story: ${id}`)
    }
    return story
  })
}

export function getActorStory(id: ShibuyaActorStoryId): ShibuyaActorStory {
  return getActorStoriesById([id])[0]
}
