import { companies, type OutreachDraft } from './research'

export const demoCustomer = { id: 'booster-customer-01', name: 'Alex' }

export interface BoutiqueReferral {
  id: string
  companySlug: string
  customerId: string
  createdAt: string
  joinedAt?: string
}

export interface PilotEnquiry {
  companySlug: string
  email: string
  note: string
  createdAt: string
  referralId?: string
}

export interface DemoActivity {
  id: string
  companySlug: string
  channel: OutreachDraft['channel']
  recipient: string
  createdAt: string
}

interface DemoState {
  referrals: BoutiqueReferral[]
  enquiries: PilotEnquiry[]
  activity: DemoActivity[]
}

export const demoStorageKey = 'booster-partner-finder-v1'
export const demoChangeEvent = 'booster-demo-change'
let sessionState: DemoState = { referrals: [], enquiries: [], activity: [] }

export function readDemo(): DemoState {
  try {
    const raw = localStorage.getItem(demoStorageKey)
    if (!raw) return sessionState
    const saved = JSON.parse(raw) as Partial<DemoState> | null
    if (!Array.isArray(saved?.enquiries) || !Array.isArray(saved.activity)) return sessionState
    return { ...saved, enquiries: saved.enquiries, activity: saved.activity, referrals: Array.isArray(saved.referrals) ? saved.referrals : [] }
  } catch {
    return sessionState
  }
}

function saveDemo(state: DemoState) {
  sessionState = state
  try {
    localStorage.setItem(demoStorageKey, JSON.stringify(state))
  } catch {
    // Keep the current tab usable when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(demoChangeEvent))
}

function makeId() {
  return crypto.getRandomValues(new Uint32Array(2)).join('-')
}

export function createBoutiqueReferral(companySlug: string) {
  if (!companies.some(company => company.slug === companySlug && company.branch)) return
  const state = readDemo()
  const existing = state.referrals.find(referral => referral.companySlug === companySlug && referral.customerId === demoCustomer.id)
  if (existing) return existing
  const referral: BoutiqueReferral = { id: makeId(), companySlug, customerId: demoCustomer.id, createdAt: new Date().toISOString() }
  saveDemo({ ...state, referrals: [referral, ...state.referrals] })
  return referral
}

export function referralStage(referral: BoutiqueReferral, state: DemoState) {
  if (referral.joinedAt) return 'joined'
  if (state.enquiries.some(item => item.referralId === referral.id && item.companySlug === referral.companySlug)) return 'enquired'
  return 'ready'
}

export function markBoutiqueJoined(referralId: string) {
  const state = readDemo()
  const referral = state.referrals.find(item => item.id === referralId)
  if (!referral || referralStage(referral, state) !== 'enquired') return
  const joined = { ...referral, joinedAt: new Date().toISOString() }
  saveDemo({ ...state, referrals: state.referrals.map(item => item.id === referralId ? joined : item) })
}

export function submitPilotEnquiry(companySlug: string, email: string, note: string, referralId: string | null) {
  const state = readDemo()
  const referral = state.referrals.find(item => item.id === referralId && item.companySlug === companySlug)
  if (referral && referralStage(referral, state) !== 'ready') return
  const enquiry: PilotEnquiry = { companySlug, email, note, createdAt: new Date().toISOString(), referralId: referral?.id }
  saveDemo({ ...state, enquiries: [enquiry, ...state.enquiries] })
}

function normalise(query: string) {
  return query.toLowerCase().replaceAll('&', ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
}

export function findDemoCompanies(query: string) {
  const term = normalise(query)
  return term ? companies.filter(company => normalise(company.name).includes(term)) : []
}

export const provider = {
  async search(query: string) {
    return findDemoCompanies(query)
  },
  async research(companySlug: string) {
    return companies.find(company => company.slug === companySlug)
  },
  async simulateSend(draft: OutreachDraft) {
    const state = readDemo()
    const entry: DemoActivity = {
      id: makeId(),
      companySlug: draft.companySlug,
      channel: draft.channel,
      recipient: draft.recipient,
      createdAt: new Date().toISOString(),
    }
    saveDemo({ ...state, activity: [entry, ...state.activity] })
    return entry
  },
}
