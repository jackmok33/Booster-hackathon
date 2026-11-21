export interface Evidence {
  id: string
  source: string
  excerpt: string
}

interface Fact {
  value: string
  evidenceId: string
}

interface Branch {
  area: string
  postcode: string
  launchPriority: boolean
  evidenceId: string
}

type PilotRole = 'Pilot sponsor' | 'Store operations' | 'Integration reviewer'

export interface Stakeholder {
  id: string
  name: string
  title: string
  pilotRole: PilotRole
  evidenceId: string
  why: string
  starter: Fact
  nextStep: string
  introduction?: {
    title: string
    request: string
    evidenceId: string
  }
  email?: string
  linkedIn?: string
}

export interface Relationship {
  managerId: string
  reportId: string
  evidenceId: string
}

export interface CompanyResearch {
  slug: string
  name: string
  initials: string
  category: string
  branch?: Branch
  otherBranches?: Fact
  platform?: Fact
  ordering?: Fact
  fulfilment?: Fact
  size?: Fact
  financials?: Fact
  noDispatch?: Fact
  pilot?: string
  evidence: Evidence[]
  people: Stakeholder[]
  relationships: Relationship[]
}

export type Channel = 'Email' | 'LinkedIn'

export interface OutreachDraft {
  companySlug: string
  contactId: string
  channel: Channel
  recipient: string
  subject: string
  body: string
  evidenceIds: string[]
}

export const companies: CompanyResearch[] = [
  {
    slug: 'rowan-and-vale',
    name: 'Rowan & Vale',
    initials: 'RV',
    category: 'Luxury fashion boutique',
    branch: { area: 'Mayfair, London', postcode: 'W1', launchPriority: true, evidenceId: 'rv-store' },
    otherBranches: { value: 'St James’s, London · SW1', evidenceId: 'rv-store' },
    platform: { value: 'Shopify', evidenceId: 'rv-commerce' },
    ordering: { value: 'Online checkout', evidenceId: 'rv-commerce' },
    fulfilment: { value: 'Click & collect', evidenceId: 'rv-collect' },
    size: { value: 'Two London boutiques', evidenceId: 'rv-store' },
    financials: { value: 'No financial disclosure in sample sources', evidenceId: 'rv-register' },
    pilot: 'Test courier collection for a small group of eligible click-and-collect orders from Mayfair.',
    evidence: [
      { id: 'rv-store', source: 'Rowan & Vale store directory', excerpt: 'Visit our Mayfair (W1) and St James’s (SW1) boutiques. This pilot assessment focuses on the Mayfair location.' },
      { id: 'rv-commerce', source: 'Rowan & Vale online shop', excerpt: 'Shop ready-to-wear and accessories online. Our online checkout is powered by Shopify.' },
      { id: 'rv-collect', source: 'Rowan & Vale collection guide', excerpt: 'Choose Mayfair Click & Collect at checkout. We’ll let you know when your order is ready for pickup.' },
      { id: 'rv-register', source: 'Rowan & Vale company directory entry', excerpt: 'The sample directory lists the company as privately held and contains no accounts or turnover figures.' },
      { id: 'rv-commercial', source: 'Rowan & Vale leadership page', excerpt: 'Amelia Hart leads commercial partnerships and approves retail pilots. Sophie Lane and Noah Bennett report to Amelia.' },
      { id: 'rv-ops', source: 'Rowan & Vale Mayfair team page', excerpt: 'Sophie Lane manages the Mayfair boutique and oversees collection orders. For operational enquiries, contact the Mayfair boutique.' },
      { id: 'rv-digital', source: 'Rowan & Vale digital team page', excerpt: 'Noah Bennett leads e-commerce and owns checkout changes and order notifications.' },
      { id: 'rv-trade', source: 'Rowan & Vale trade appointments page', excerpt: 'Retail partners can request a trade appointment at our Mayfair boutique through the partnerships inbox. Our team confirms the meeting and who will attend.' },
    ],
    people: [
      {
        id: 'amelia', name: 'Amelia Hart', title: 'Commercial Director', pilotRole: 'Pilot sponsor',
        evidenceId: 'rv-commercial', why: 'Owns partnership decisions and can approve a small retail pilot.',
        starter: { value: 'Your Mayfair boutique already offers click-and-collect.', evidenceId: 'rv-collect' },
        nextStep: 'Would you be open to a 15-minute call to scope a small within-the-hour delivery pilot from Mayfair?',
        introduction: {
          title: 'Request a Mayfair trade appointment',
          request: 'Could we book a Mayfair trade appointment to discuss a small delivery pilot? If you’re available, we’d value your input on how to measure success.',
          evidenceId: 'rv-trade',
        },
        email: 'partnerships@rowan-and-vale.example', linkedIn: 'Amelia Hart · sample professional profile',
      },
      {
        id: 'sophie', name: 'Sophie Lane', title: 'Mayfair Store Manager', pilotRole: 'Store operations',
        evidenceId: 'rv-ops', why: 'Can tell Booster how the boutique prepares and hands over collection orders.',
        starter: { value: 'Your Mayfair collection guide says the team lets customers know when orders are ready.', evidenceId: 'rv-collect' },
        nextStep: 'Could we walk through how your team might hand a few eligible orders to a Booster courier?',
        introduction: {
          title: 'Ask for a boutique walk-through',
          request: 'Could we arrange a brief visit at a time that suits your team to walk through how you prepare and hand over a collection order?',
          evidenceId: 'rv-ops',
        },
        email: 'mayfair@rowan-and-vale.example', linkedIn: 'Sophie Lane · sample professional profile',
      },
      {
        id: 'noah', name: 'Noah Bennett', title: 'Head of E-commerce', pilotRole: 'Integration reviewer',
        evidenceId: 'rv-digital', why: 'Owns the checkout and order notifications a delivery trial could touch.',
        starter: { value: 'Your online store uses Shopify checkout.', evidenceId: 'rv-commerce' },
        nextStep: 'Would you review what order information you could share for a small within-the-hour pilot?',
        introduction: {
          title: 'Invite e-commerce to a pilot workshop',
          request: 'Would you join a short workshop with the Mayfair team to map what happens between a Shopify order and courier pickup? We can meet wherever works for your team.',
          evidenceId: 'rv-digital',
        },
        email: 'ecommerce@rowan-and-vale.example', linkedIn: 'Noah Bennett · sample professional profile',
      },
    ],
    relationships: [
      { managerId: 'amelia', reportId: 'sophie', evidenceId: 'rv-commercial' },
      { managerId: 'amelia', reportId: 'noah', evidenceId: 'rv-commercial' },
    ],
  },
  {
    slug: 'studio-lichen',
    name: 'Studio Lichen',
    initials: 'SL',
    category: 'Independent accessories boutique',
    branch: { area: 'Covent Garden, London', postcode: 'WC2', launchPriority: true, evidenceId: 'sl-store' },
    platform: { value: 'WooCommerce', evidenceId: 'sl-shop' },
    ordering: { value: 'Online checkout', evidenceId: 'sl-shop' },
    fulfilment: { value: 'Orders packed at the boutique', evidenceId: 'sl-shipping' },
    size: { value: 'One boutique', evidenceId: 'sl-store' },
    pilot: 'Ask the boutique to test courier pickup for gift orders it already packs on site.',
    evidence: [
      { id: 'sl-store', source: 'Studio Lichen shop page', excerpt: 'Our only boutique is in Covent Garden (WC2). Contact our shop team for retail partnerships.' },
      { id: 'sl-shop', source: 'Studio Lichen checkout', excerpt: 'Buy bags and accessories through our WooCommerce online shop.' },
      { id: 'sl-shipping', source: 'Studio Lichen shipping and gifting guide', excerpt: 'We pack online orders at our Covent Garden boutique. Gift wrapping is available at checkout.' },
    ],
    people: [
      {
        id: 'lichen-shop', name: 'Studio Lichen shop team', title: 'Published boutique inbox', pilotRole: 'Store operations',
        evidenceId: 'sl-store', why: 'The boutique lists this inbox for partnership enquiries. Ask who can sponsor a pilot.',
        starter: { value: 'Your Covent Garden team already packs online orders and offers gift wrapping.', evidenceId: 'sl-shipping' },
        nextStep: 'Could you put me in touch with whoever could trial Booster delivery for a small set of gift orders?',
        introduction: {
          title: 'Ask the shop team for an introduction',
          request: 'Could you introduce me to whoever manages fulfilment and ask whether they’d be open to a scheduled visit to discuss delivery for gift orders?',
          evidenceId: 'sl-store',
        },
        email: 'shop@studio-lichen.example',
      },
    ],
    relationships: [],
  },
  {
    slug: 'forma-arc',
    name: 'Forma Arc',
    initials: 'FA',
    category: 'Contemporary fashion studio',
    branch: { area: 'Clerkenwell, London', postcode: 'EC1', launchPriority: true, evidenceId: 'fa-store' },
    size: { value: 'One showroom', evidenceId: 'fa-store' },
    evidence: [{ id: 'fa-store', source: 'Forma Arc visit page', excerpt: 'Our Clerkenwell showroom is open by appointment. The listing does not describe online orders or how products are dispatched.' }],
    people: [],
    relationships: [],
  },
  {
    slug: 'sable-letter',
    name: 'Sable Letter',
    initials: 'SL',
    category: 'Online fashion publication',
    noDispatch: { value: 'Digital subscriptions only', evidenceId: 'sa-about' },
    evidence: [{ id: 'sa-about', source: 'Sable Letter about page', excerpt: 'We sell digital fashion subscriptions only. We do not have a store, fulfilment location, or physical products.' }],
    people: [],
    relationships: [],
  },
]

export function assessFit(company: CompanyResearch) {
  if (company.noDispatch) {
    return { status: 'Low fit', tone: 'low', reason: 'Digital subscriptions only. There are no physical orders for Booster to deliver.', evidenceIds: [company.noDispatch.evidenceId] } as const
  }
  const handoff = company.fulfilment ?? company.ordering
  if (!company.branch || !handoff) {
    return { status: 'Needs review', tone: 'review', reason: 'Confirm where physical orders are prepared and how a courier could collect them.', evidenceIds: company.branch ? [company.branch.evidenceId] : [] } as const
  }

  return {
    status: 'Qualified',
    tone: 'qualified',
    reason: company.branch.launchPriority
      ? 'A Central London boutique and an existing order workflow make this a credible pilot candidate.'
      : 'An existing order workflow supports a pilot. Confirm Booster coverage before making delivery commitments.',
    evidenceIds: [company.branch.evidenceId, handoff.evidenceId],
  } as const
}

const pilotPriority: Record<PilotRole, number> = { 'Pilot sponsor': 0, 'Store operations': 1, 'Integration reviewer': 2 }

export function rankStakeholders(company: CompanyResearch) {
  const sources = new Set(company.evidence.map(item => item.id))
  return [...company.people].sort((left, right) =>
    pilotPriority[left.pilotRole] - pilotPriority[right.pilotRole]
    || Number(sources.has(right.evidenceId)) - Number(sources.has(left.evidenceId))
    || Number(Boolean(right.email || right.linkedIn)) - Number(Boolean(left.email || left.linkedIn))
    || left.name.localeCompare(right.name),
  ).slice(0, 3)
}

export function createDraft(company: CompanyResearch, person: Stakeholder, channel: Channel, introduction?: Stakeholder['introduction']): OutreachDraft | undefined {
  const recipient = channel === 'Email' ? person.email : person.linkedIn
  if (!recipient) return

  const greeting = person.title === 'Published boutique inbox' ? 'Hi team' : `Hi ${person.name.split(' ')[0]}`
  const pitch = 'I’m reaching out from Booster. We deliver online orders from nearby boutiques within the hour.'
  const nextStep = introduction?.request ?? person.nextStep
  const purpose = introduction ? 'A meeting about a delivery pilot for ' : 'A delivery pilot for '
  const evidenceIds = Array.from(new Set([
    person.starter.evidenceId,
    ...(introduction ? [introduction.evidenceId] : []),
  ]))
  return {
    companySlug: company.slug,
    contactId: person.id,
    channel,
    recipient,
    subject: channel === 'Email' ? purpose + company.name : '',
    body: channel === 'Email'
      ? `${greeting},\n\n${person.starter.value} ${pitch}\n\n${nextStep}\n\nBest,\nThe Booster team`
      : `${greeting}, ${person.starter.value} I’m with Booster, a within-the-hour delivery service for boutique orders. ${nextStep}`,
    evidenceIds,
  }
}
