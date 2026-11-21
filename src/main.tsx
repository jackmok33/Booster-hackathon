import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, Building2, Check, ChevronRight, CircleHelp, ClipboardList, FileText, FlaskConical,
  CalendarDays, Gift, Link2, Mail, MapPin, Network, Search, ShoppingBag, Store, X, Zap,
} from 'lucide-react'
import {
  assessFit, companies, createDraft, rankStakeholders,
  type CompanyResearch, type OutreachDraft, type Stakeholder,
} from './research'
import {
  createBoutiqueReferral, demoChangeEvent, demoCustomer, demoStorageKey, findDemoCompanies, markBoutiqueJoined,
  provider, readDemo, referralStage, submitPilotEnquiry, type BoutiqueReferral,
} from './demo'
import './styles.css'

type DemoState = ReturnType<typeof readDemo>
type ShowEvidence = (ids: readonly string[]) => void

function useDemoState() {
  const [state, setState] = useState(readDemo)
  useEffect(() => {
    const update = () => setState(readDemo())
    const onStorage = (event: StorageEvent) => {
      if (event.key === demoStorageKey || event.key === null) update()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(demoChangeEvent, update)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(demoChangeEvent, update)
    }
  }, [])
  return state
}

function useRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/research')
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(1) || '/research')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}

function Dialog({ title, children, dismiss }: { title: string; children: ReactNode; dismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); dismiss() }}>
    <header className="dialog-header">
      <h2 id="dialog-title">{title}</h2>
      <button className="icon-button" type="button" aria-label="Close dialog" onClick={dismiss}><X size={20} /></button>
    </header>
    {children}
  </dialog>
}

function SourceButton({ ids, show }: { ids: readonly string[]; show: ShowEvidence }) {
  return <button className="source-button" type="button" onClick={() => show(ids)}>
    <FileText size={14} /> {ids.length === 1 ? 'Source' : 'Sources'}
  </button>
}

function FitBadge({ company }: { company: CompanyResearch }) {
  const fit = assessFit(company)
  return <span className={'fit-badge ' + fit.tone}>{fit.tone === 'qualified' ? <Check size={14} /> : <CircleHelp size={14} />}{fit.status}</span>
}

function FitReport({ company, show, onFindPeople }: { company: CompanyResearch; show: ShowEvidence; onFindPeople: () => void }) {
  const fit = assessFit(company)
  const facts = [
    { label: 'Pilot location', fact: company.branch && { value: company.branch.area + ' · ' + company.branch.postcode, evidenceId: company.branch.evidenceId } },
    ...(company.otherBranches ? [{ label: 'Other branches', fact: company.otherBranches }] : []),
    { label: 'Commerce platform', fact: company.platform },
    { label: 'Online ordering', fact: company.ordering ?? company.noDispatch },
    { label: 'Fulfilment', fact: company.fulfilment },
    { label: 'Company size', fact: company.size },
    { label: 'Financial information', fact: company.financials },
  ]

  return <section className="card fit-report" aria-label="Company assessment">
    <header className="company-header">
      <div className="company-tile">{company.initials}</div>
      <div><div className="category">{company.category}</div><h2>{company.name}</h2></div>
      <FitBadge company={company} />
    </header>
    <div className="verdict">
      <ClipboardList size={20} />
      <div><h3>Pilot assessment</h3><p>{fit.reason}</p></div>
      {!!fit.evidenceIds.length && <SourceButton ids={fit.evidenceIds} show={show} />}
    </div>
    <dl className="facts">
      {facts.map(({ label, fact }) => <div className="fact" key={label}>
        <dt>{label}</dt>
        <dd className={fact ? '' : 'muted'}>{fact?.value ?? 'Unknown'}</dd>
        {fact && <SourceButton ids={[fact.evidenceId]} show={show} />}
      </div>)}
    </dl>
    {fit.tone === 'qualified' && <footer className="pilot-footer">
      <div><h3>Proposed pilot</h3><p>{company.pilot}</p></div>
      <button className="button primary" onClick={onFindPeople}><Network size={17} />Find decision-makers</button>
    </footer>}
  </section>
}

const contactTabs = [
  { id: 'messages', label: 'Email & LinkedIn', Icon: Mail },
  { id: 'introductions', label: 'In-person introductions', Icon: CalendarDays },
] as const

function RecommendedContacts({ company, show, openDraft }: { company: CompanyResearch; show: ShowEvidence; openDraft: (draft: OutreachDraft | undefined) => void }) {
  const [active, setActive] = useState(0)
  const ranked = rankStakeholders(company)

  return <section aria-labelledby="recommended-contacts-title">
    <h2 className="recommended-title" id="recommended-contacts-title">Recommended contacts</h2>
    <div className="contact-tabs" role="tablist" aria-labelledby="recommended-contacts-title" onKeyDown={event => {
      const last = contactTabs.length - 1
      const next = { ArrowLeft: (active + last) % contactTabs.length, ArrowRight: (active + 1) % contactTabs.length, Home: 0, End: last }[event.key]
      if (next === undefined) return
      event.preventDefault()
      setActive(next)
      event.currentTarget.querySelectorAll('button')[next]?.focus()
    }}>
      {contactTabs.map(({ id, label, Icon }, index) => <button type="button" role="tab" key={id}
        id={'contact-tab-' + id} aria-controls={'contact-panel-' + id} aria-selected={active === index}
        tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)}>
        <Icon size={17} />{label}
      </button>)}
    </div>
    {contactTabs.map(({ id }, index) => <div role="tabpanel" key={id} hidden={active !== index}
      id={'contact-panel-' + id} aria-labelledby={'contact-tab-' + id} tabIndex={0}>
      {active === index && <>
        {id === 'introductions' && <p className="introductions-description">Request a meeting through the boutique’s business channels. Agree on an appointment with the team before visiting.</p>}
        <div className="contact-list">
          {ranked.map((person, rank) => <article className="card contact-card" key={person.id}>
            <header><span className="rank">{rank + 1}</span><div><h3>{person.name}</h3><p>{person.title}</p></div><span className="role">{person.pilotRole}</span></header>
            <p>{person.why} <SourceButton ids={[person.evidenceId]} show={show} /></p>
            {id === 'messages' ? <>
              <dl>
                <dt>Conversation starter</dt><dd>{person.starter.value} <SourceButton ids={[person.starter.evidenceId]} show={show} /></dd>
                <dt>Suggested next step</dt><dd>{person.nextStep}</dd>
              </dl>
              <footer>
                {person.email && <button className="button secondary" onClick={() => openDraft(createDraft(company, person, 'Email'))}><Mail size={16} /> Email</button>}
                {person.linkedIn && <button className="button secondary" onClick={() => openDraft(createDraft(company, person, 'LinkedIn'))}><span className="linkedin-icon" aria-hidden="true">in</span> LinkedIn</button>}
              </footer>
            </> : person.introduction ? <>
              <dl>
                <dt>{person.introduction.title}</dt>
                <dd>{person.introduction.request} <SourceButton ids={[person.introduction.evidenceId]} show={show} /></dd>
              </dl>
              {(person.email || person.linkedIn) && <footer>
                <button className="button secondary" onClick={() => openDraft(createDraft(company, person, person.email ? 'Email' : 'LinkedIn', person.introduction))}><CalendarDays size={16} /> Draft meeting request</button>
              </footer>}
            </> : <p>No public business meeting route found.</p>}
          </article>)}
        </div>
      </>}
    </div>)}
  </section>
}

function DecisionMap({ company, show, openDraft }: { company: CompanyResearch; show: ShowEvidence; openDraft: (draft: OutreachDraft | undefined) => void }) {
  const roots = company.people.filter(person => !company.relationships.some(edge => edge.reportId === person.id))

  function branch(person: Stakeholder, reportingEvidence?: string) {
    const reports = company.relationships.filter(edge => edge.managerId === person.id)
    return <li key={person.id}>
      {reportingEvidence && <div className="reporting-line">
        <button className="source-button" onClick={() => show([reportingEvidence])}>Reports to <FileText size={13} /></button>
      </div>}
      <div className="graph-node">
        <span className="role">{person.pilotRole}</span>
        <strong>{person.name}</strong>
        <small>{person.title}</small>
        <SourceButton ids={[person.evidenceId]} show={show} />
      </div>
      {!!reports.length && <ul className="graph-children">
        {reports.map(edge => {
          const report = company.people.find(item => item.id === edge.reportId)
          return report && branch(report, edge.evidenceId)
        })}
      </ul>}
    </li>
  }

  return <section className="decision-section" aria-labelledby="decision-title">
    <div className="section-heading"><Network size={21} /><h2 id="decision-title" tabIndex={-1}>Decision-maker map</h2></div>
    <div className="card graph-card">
      <p className="muted">{company.relationships.length ? 'Each reporting line opens its supporting source.' : 'The sample sources identify a business contact route. Reporting lines are unknown.'}</p>
      <ul className="graph-roots">{roots.map(person => branch(person))}</ul>
    </div>
    <RecommendedContacts company={company} show={show} openDraft={openDraft} />
  </section>
}

function DraftDialog({ initial, company, dismiss }: { initial: OutreachDraft; company: CompanyResearch; dismiss: () => void }) {
  const [draft, setDraft] = useState(initial)
  const [status, setStatus] = useState<'draft' | 'sending' | 'sent' | 'error'>('draft')
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending' || status === 'sent' || !draft.body.trim() || (draft.channel === 'Email' && !draft.subject.trim())) return
    setStatus('sending')
    try {
      await provider.simulateSend(draft)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return <Dialog title={draft.channel + ' draft'} dismiss={dismiss}>
    {status === 'sent' ? <div className="success-block" role="status">
      <Check size={26} /><h3>Simulated send recorded</h3><p>The message appears in demo activity.</p>
      <button type="button" className="button primary" onClick={dismiss}>Done</button>
    </div> : <form className="stack-form" onSubmit={send}>
      <div className="field"><span>Recipient</span><p className="recipient">{draft.recipient}</p></div>
      {draft.channel === 'Email' && <label className="field">Subject<input value={draft.subject} required onChange={event => setDraft({ ...draft, subject: event.target.value })} /></label>}
      <label className="field">Message<textarea rows={7} value={draft.body} required onChange={event => setDraft({ ...draft, body: event.target.value })} /></label>
      <details className="draft-sources" open>
        <summary>Supporting sample evidence</summary>
        {company.evidence.filter(item => draft.evidenceIds.includes(item.id)).map(item => <div key={item.id}><strong>{item.source}</strong><p>{item.excerpt}</p></div>)}
      </details>
      {status === 'error' && <p role="alert">The simulation failed. Try again.</p>}
      <footer className="form-footer"><span className="muted">Demo action</span><button className="button primary" disabled={status === 'sending' || !draft.body.trim() || (draft.channel === 'Email' && !draft.subject.trim())}>{status === 'sending' ? 'Recording…' : 'Simulate send'}</button></footer>
    </form>}
  </Dialog>
}

function ReferralStatus({ referral, state }: { referral: BoutiqueReferral; state: DemoState }) {
  const stage = referralStage(referral, state)
  return <span className={'referral-status ' + stage}>{{
    ready: 'Link ready',
    enquired: 'Pilot enquiry received',
    joined: 'Demo credit unlocked',
  }[stage]}</span>
}

function PartnerActivity({ company, state }: { company: CompanyResearch; state: DemoState }) {
  const referrals = state.referrals.filter(item => item.companySlug === company.slug)
  const enquiries = state.enquiries.filter(item => item.companySlug === company.slug)
  const activity = state.activity.filter(item => item.companySlug === company.slug)
  return <aside className="research-rail" aria-label="Boutique referrals and activity">
    <section className="card referral-card">
      <div className="section-heading"><Gift size={18} /><h2>Boutique referrals</h2></div>
      {referrals.length === 0 ? <p className="muted">No referral links yet.</p> : <ul className="referral-list">
        {referrals.map(referral => <li key={referral.id}>
          <strong>Referred by {demoCustomer.name}</strong>
          <ReferralStatus referral={referral} state={state} />
          {referralStage(referral, state) === 'enquired' && <button type="button" className="button secondary" onClick={() => markBoutiqueJoined(referral.id)}>
            <Check size={16} /> Mark boutique joined
          </button>}
        </li>)}
      </ul>}
      {company.branch && <a className="button secondary full" href={'#/store/' + company.slug}>View retailer page <ChevronRight size={16} /></a>}
    </section>
    <section className="card activity-card">
      <div className="section-heading"><Activity size={18} /><h2>Demo activity</h2></div>
      <h3>Pilot enquiries <span>{enquiries.length}</span></h3>
      {enquiries.length === 0 ? <p className="muted">No pilot enquiries yet.</p> : <ul>
        {enquiries.map(item => <li key={item.createdAt + item.email}><strong>{item.email}</strong>
          {item.referralId && <span className="referral-source">Customer referral</span>}
          <p>{item.note}</p>
        </li>)}
      </ul>}
      <h3>Simulated outreach <span>{activity.length}</span></h3>
      {activity.length === 0 ? <p className="muted">No sends recorded yet.</p> : <ul>
        {activity.map(item => <li key={item.id}><strong>{item.channel} · Simulated</strong><p>{item.recipient}</p></li>)}
      </ul>}
    </section>
  </aside>
}

function Research({ state }: { state: DemoState }) {
  const [company, setCompany] = useState<CompanyResearch>()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [matches, setMatches] = useState<CompanyResearch[]>([])
  const [searchState, setSearchState] = useState<'ready' | 'searching' | 'empty' | 'choose'>('ready')
  const [showPeople, setShowPeople] = useState(false)
  const [evidenceIds, setEvidenceIds] = useState<readonly string[]>([])
  const [draft, setDraft] = useState<OutreachDraft>()
  const searchVersion = useRef(0)
  const suggestions = findDemoCompanies(query)
  const dropdownOpen = showSuggestions && suggestions.length > 0
  const selectedSuggestion = dropdownOpen ? suggestions[activeSuggestion] : undefined

  function closeSuggestions() {
    setShowSuggestions(false)
    setActiveSuggestion(-1)
  }

  async function selectCompany(slug: string) {
    closeSuggestions()
    const version = ++searchVersion.current
    const result = await provider.research(slug)
    if (version !== searchVersion.current) return
    setCompany(result)
    setQuery(result?.name ?? '')
    setShowPeople(false)
    setSearchState('ready')
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    closeSuggestions()
    const version = ++searchVersion.current
    setSearchState('searching')
    const results = await provider.search(query)
    if (version !== searchVersion.current) return
    if (results.length === 1) {
      await selectCompany(results[0].slug)
    } else {
      setMatches(results)
      setCompany(undefined)
      setShowPeople(false)
      setSearchState(results.length > 1 ? 'choose' : 'empty')
    }
  }

  useEffect(() => {
    if (showPeople) {
      const heading = document.getElementById('decision-title')
      heading?.focus({ preventScroll: true })
      heading?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showPeople])

  return <>
    <section className="hero research-hero">
      <div className="research-art-clip" aria-hidden="true"><div className="hero-art"><div /><div /><div /><Store size={54} strokeWidth={1.15} /></div></div>
      <div className="hero-content">
        <div className="eyebrow"><Search size={15} /> Company research</div>
        <h1>Find your next retail partner.</h1>
        <p>Check whether a boutique can trial within-the-hour delivery, then find the people who can make it happen.</p>
        <form className="search-form" onSubmit={search}>
          <label className="sr-only" htmlFor="company-search">Company name</label>
          <Search size={19} />
          <input id="company-search" role="combobox" aria-autocomplete="list" aria-expanded={dropdownOpen}
            aria-controls={dropdownOpen ? 'company-suggestions' : undefined}
            aria-activedescendant={selectedSuggestion ? 'suggestion-' + selectedSuggestion.slug : undefined}
            autoComplete="off" value={query} placeholder="Enter a company name" required
            onFocus={() => setShowSuggestions(true)} onBlur={closeSuggestions}
            onChange={event => {
              setQuery(event.target.value)
              setActiveSuggestion(-1)
              setShowSuggestions(true)
            }}
            onKeyDown={event => {
              if (event.nativeEvent.isComposing) return
              if (event.key === 'Escape' && dropdownOpen) {
                event.preventDefault()
                closeSuggestions()
              }
              if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && suggestions.length > 0) {
                event.preventDefault()
                const direction = event.key === 'ArrowDown' ? 1 : -1
                setShowSuggestions(true)
                setActiveSuggestion(index => index < 0
                  ? direction === 1 ? 0 : suggestions.length - 1
                  : (index + direction + suggestions.length) % suggestions.length)
              }
              if (event.key === 'Enter' && selectedSuggestion) {
                event.preventDefault()
                void selectCompany(selectedSuggestion.slug)
              }
            }} />
          <button className="button accent" disabled={searchState === 'searching'}>{searchState === 'searching' ? 'Researching…' : 'Research company'}</button>
          {dropdownOpen && <ul className="company-suggestions" id="company-suggestions" role="listbox" aria-label="Matching companies">
            {suggestions.map(item => <li key={item.slug} id={'suggestion-' + item.slug} role="option"
              aria-selected={item.slug === selectedSuggestion?.slug}
              onPointerDown={event => event.preventDefault()} onClick={() => void selectCompany(item.slug)}>
              <Building2 size={17} /><span>{item.name}</span>
            </li>)}
          </ul>}
        </form>
      </div>
    </section>
    {searchState === 'empty' && <div className="card empty-state" role="status"><Search size={24} /><h2>No matching company</h2><p>Check the spelling or try another company name.</p></div>}
    {searchState === 'choose' && <div className="card empty-state" role="status"><h2>Choose a match</h2><div className="match-list">
      {matches.map(item => <button className="button secondary" key={item.slug} onClick={() => void selectCompany(item.slug)}>{item.name}</button>)}
    </div></div>}
    {company && <div className="research-grid">
      <div className="research-content">
        <FitReport company={company} show={setEvidenceIds} onFindPeople={() => setShowPeople(true)} />
        {showPeople && assessFit(company).tone === 'qualified' && <DecisionMap company={company} show={setEvidenceIds} openDraft={setDraft} />}
      </div>
      <PartnerActivity company={company} state={state} />
    </div>}
    {company && evidenceIds.length > 0 && <Dialog title="Sample evidence" dismiss={() => setEvidenceIds([])}>
      <p className="muted">Fictional source excerpts for the demo.</p>
      <div className="evidence-list">
        {company.evidence.filter(item => evidenceIds.includes(item.id)).map(item => <figure key={item.id}><figcaption>{item.source}</figcaption><blockquote>{item.excerpt}</blockquote></figure>)}
      </div>
    </Dialog>}
    {draft && company && <DraftDialog initial={draft} company={company} dismiss={() => setDraft(undefined)} />}
  </>
}

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

const referralStores = companies.filter(company => company.branch)

function CustomerReferrals({ state }: { state: DemoState }) {
  const [store, setStore] = useState(referralStores[0].slug)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const referrals = state.referrals.filter(item => item.customerId === demoCustomer.id)
  const referral = referrals.find(item => item.companySlug === store)
  const retailerPath = referral ? '#/store/' + store + '?ref=' + encodeURIComponent(referral.id) : ''
  const shareUrl = referral ? new URL(retailerPath, location.href).href : ''

  function createLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createBoutiqueReferral(store)
  }

  return <>
    <section className="hero">
      <div className="hero-art" aria-hidden="true"><div /><div /><div /><Gift size={54} strokeWidth={1.15} /></div>
      <div className="hero-content">
        <div className="eyebrow"><Gift size={15} /> Booster customer · {demoCustomer.name}</div>
        <h1>Refer a boutique. Earn a delivery credit.</h1>
        <p>Invite a boutique you already shop with to offer Booster. When they join through your link, you unlock a credit for a future Booster delivery.</p>
      </div>
    </section>
    <div className="two-column-grid">
      <section className="card form-card">
        <h2>Invite a boutique</h2>
        <form className="stack-form" onSubmit={createLink}>
          <label className="field">Boutique<select value={store} onChange={event => { setStore(event.target.value); setCopyStatus('idle') }}>
            {referralStores.map(item => <option key={item.slug} value={item.slug}>{item.name} · {item.branch?.area}</option>)}
          </select></label>
          {!referral && <button className="button primary"><Link2 size={17} /> Create referral link</button>}
        </form>
        {referral && <div className="share-result">
          <p className="muted">Send this link to the boutique’s team so Booster can credit your referral.</p>
          <label className="field">Your referral link<input readOnly value={shareUrl} onFocus={event => event.target.select()} /></label>
          <div className="button-group">
            <button className="button primary" onClick={async () => setCopyStatus(await copyLink(shareUrl) ? 'copied' : 'manual')}><Link2 size={16} /> {copyStatus === 'copied' ? 'Copied' : 'Copy referral link'}</button>
            <a href={retailerPath} target="_blank" rel="noreferrer" className="button secondary">Preview boutique invite</a>
          </div>
          {copyStatus === 'manual' && <p role="status" className="muted">Select the link above and copy it manually.</p>}
        </div>}
      </section>
      <section className="card form-card" aria-live="polite">
        <h2>Your referrals</h2>
        {referrals.length === 0 ? <p className="muted">Create your first link to track a boutique’s progress here.</p> : <ul className="referral-list">
          {referrals.map(item => <li key={item.id}>
            <strong>{referralStores.find(company => company.slug === item.companySlug)?.name ?? item.companySlug}</strong>
            <ReferralStatus referral={item} state={state} />
          </li>)}
        </ul>}
        <p className="reward-note"><Gift size={17} /> One simulated delivery credit per boutique after it joins.</p>
      </section>
    </div>
  </>
}

function Retailer({ slug, state, referralId }: { slug: string; state: DemoState; referralId: string | null }) {
  const company = companies.find(item => item.slug === slug)
  const [showForm, setShowForm] = useState(false)
  const [sent, setSent] = useState(false)
  if (!company) return <div className="card empty-state"><h1>Store page unavailable</h1><a href="#/recommend" className="button primary">Browse demo boutiques</a></div>

  const referral = state.referrals.find(item => item.id === referralId && item.companySlug === slug)
  const alreadySubmitted = referral && referralStage(referral, state) !== 'ready'
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email') ?? '').trim()
    const note = String(fields.get('note') ?? '').trim()
    if (!note) return
    submitPilotEnquiry(slug, email, note, referral?.id ?? null)
    setShowForm(false)
    setSent(true)
  }

  return <>
    <section className="hero retailer-hero">
      <div className="hero-art" aria-hidden="true"><div /><div /><div /><Store size={54} strokeWidth={1.15} /></div>
      <div className="hero-content">
        <div className="eyebrow"><Store size={15} /> {referral ? 'Referred by a Booster customer' : 'Booster for boutiques'}</div>
        <h1>{company.name}</h1>
        <p>{referral ? demoCustomer.name + ', a Booster customer, invited your team to offer within-the-hour delivery.' : 'Explore within-the-hour delivery for orders from your boutique.'}</p>
      </div>
    </section>
    <div className="two-column-grid">
      <section className="card form-card retailer-pilot">
        <span className="feature-icon"><ShoppingBag size={22} /></span>
        <h2>Deliver from your boutique</h2>
        <p className="muted">Your team prepares eligible orders for pickup. Booster delivers them to nearby customers within the hour.</p>
        {referral && <p className="reward-note"><Gift size={17} /> {demoCustomer.name} earns a demo delivery credit if your boutique joins.</p>}
        {referralId && !referral && <p className="notice" role="status">This referral link couldn’t be matched in this demo browser. You can still enquire about a pilot.</p>}
      </section>
      <section className="card form-card retailer-pilot">
        <span className="feature-icon"><Zap size={22} /></span>
        <h2>Try a Booster pilot</h2>
        <p className="muted">Explore which orders your team could prepare for delivery from the boutique.</p>
        {sent || alreadySubmitted ? <div className="notice" role="status"><Check size={18} /> Demo pilot enquiry recorded.</div> : <button className="button primary" onClick={() => setShowForm(true)}>Discuss a pilot</button>}
      </section>
    </div>
    {showForm && <Dialog title="Discuss a pilot" dismiss={() => setShowForm(false)}>
      <p className="muted">Use a sample work email for this demo.</p>
      <form className="stack-form" onSubmit={submit}>
        <label className="field">Work email<input type="email" name="email" placeholder="team@boutique.example" required maxLength={150} /></label>
        <label className="field">What would you like to try?<textarea name="note" rows={4} required maxLength={500} placeholder="We’d like to test courier collection from our boutique." onChange={event => event.target.setCustomValidity(event.target.value.trim() ? '' : 'Enter a short note.')} /></label>
        <button className="button primary">Submit demo enquiry</button>
      </form>
    </Dialog>}
  </>
}

function App() {
  const route = useRoute()
  const state = useDemoState()
  const [path, search] = route.split('?', 2)
  const isRetailer = path.startsWith('/store/')
  const isReferral = path === '/recommend'
  return <div className={'app-shell ' + (isRetailer ? 'retailer-layout' : '')}>
    {!isRetailer && <aside className="sidebar">
      <a className="brand" href="#/research"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span>booster<span className="brand-dot">.</span><small>Partner Finder</small></span></a>
      <nav aria-label="Main navigation">
        <a href="#/research" aria-current={!isReferral ? 'page' : undefined}><Building2 size={18} />Company research</a>
        <a href="#/recommend" aria-current={isReferral ? 'page' : undefined}><Gift size={18} />Boutique referrals</a>
      </nav>
      <div className="sidebar-footer"><MapPin size={16} /> Central London launch</div>
    </aside>}
    <div className="app-body">
      <header className="topbar">
        {isRetailer ? <a className="retailer-brand" href="#/recommend"><Zap size={20} fill="currentColor" /> booster.</a> : <span>{isReferral ? 'Boutique referrals' : 'Partner workspace'}</span>}
        <span className="demo-label"><FlaskConical size={15} /> Demo data</span>
      </header>
      <main className="main-content">
        {isRetailer ? <Retailer key={route} slug={path.slice('/store/'.length)} referralId={new URLSearchParams(search).get('ref')} state={state} /> : <>
          <div hidden={isReferral}><Research state={state} /></div>
          {isReferral && <CustomerReferrals state={state} />}
        </>}
      </main>
    </div>
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
