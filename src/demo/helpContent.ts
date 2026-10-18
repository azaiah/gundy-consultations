export type HelpEntry = { title: string; intro: string; bullets: string[] }

export const helpContent: Record<string, HelpEntry> = {
  dashboard: {
    title: 'Dashboard',
    intro: 'Your morning view: what came in, what is due, and how the month is tracking.',
    bullets: ['Tap any KPI tile to jump to that list', 'The latest sweep card shows when the engine last ran and what it found', 'Switch the revenue chart to a table with the toggle', 'Use the arrows on Tip of the Day to browse all 20 tips'],
  },
  brain: {
    title: 'Company Brain',
    intro: 'Everything the engine knows about you. Change anything here and every bid and lead is re-scored instantly.',
    bullets: ['Toggle a certification off and watch set-aside bids drop', 'Lower the bonding single limit to see large bids become no-go', 'Add a trade to qualify for more work', 'Counties listed here count as home turf for distance scoring'],
  },
  bids: {
    title: 'Bids board',
    intro: 'Public solicitations and GC invitations, scored for fit.',
    bullets: ['Click a row for the scope, addenda, score breakdown and a drafted response', 'Filter by source, status or set-aside; sort any column', 'Add to pipeline moves it onto the kanban', 'Mark no-bid with a reason so the engine stops surfacing it'],
  },
  leads: {
    title: 'Leads board',
    intro: 'Private leads from permits, build-outs, property managers and HOAs.',
    bullets: ['Permit records show the address, valuation, filing date and applicant', 'Each lead has a drafted email and a call script', 'Add to pipeline or create a contact in one click'],
  },
  sweeps: {
    title: 'Sweeps',
    intro: 'Every run, stamped. See which sources returned something, nothing, or could not be read.',
    bullets: ['Run sweep now (demo) simulates a run and adds new stamped records', 'New records carry a New badge with the time found', 'Your package sets the cadence; the next scheduled run is shown at the top', 'Turn sources on or off in Settings'],
  },
  pipeline: {
    title: 'Pipeline',
    intro: 'Found to Won or Lost, on one board.',
    bullets: ['Drag cards between columns, or use Move to on touch and keyboard', 'Red borders mean a deadline inside 3 days; amber inside 7', 'A flag means the card has not been touched in 7+ days', 'The summary row shows win rate and dollars bid versus won'],
  },
  outreach: {
    title: 'Outreach',
    intro: 'Drafted emails and call scripts. Nothing is sent until you approve it.',
    bullets: ['Edit any draft inline', 'Approve moves it to Approved; Send marks it Sent (demo)', 'Log a reply to close the loop', 'Use the message generator for a fresh draft in a different tone'],
  },
  briefing: {
    title: 'Weekly Briefing',
    intro: 'A plain-English report of what is new, what is urgent, and what to do next.',
    bullets: ['The 14-day calendar lists every bid due and pre-bid meeting', 'Print it for the Monday meeting', 'Everything here is computed live from the boards'],
  },
  contacts: {
    title: 'Contacts',
    intro: 'Leads, customers and subcontractors with notes, logs, photos and to-dos.',
    bullets: ['Search any list by name, company, phone or email', 'Import a .vcf file from your phone, or load sample contacts', 'Tag each import as Lead, Customer or Sub before it lands', 'Log calls, texts, emails and site visits on the timeline', 'Subcontractor paperwork lives on the Compliance tab'],
  },
  projects: {
    title: 'Projects',
    intro: 'Every job from estimate to final invoice.',
    bullets: ['Tabs: Checklist, Punch list, Estimate, Proposal, Change orders, Daily logs, Schedule, Costs, Invoices, Client view', 'Punch items accept photos from the camera', 'Daily logs are append-only; an edit creates a new entry', 'The estimator pulls from the price book and lets you set the tax rate per estimate'],
  },
  calendar: {
    title: 'Calendar',
    intro: 'Jobs, site visits, inspections, pre-bids and bid deadlines.',
    bullets: ['Switch between month, week and agenda', 'Add an event and pick the time with the wheel picker', 'Export one event or the whole calendar as .ics', 'Calendar sync shows how the live app reads and writes your phone calendar'],
  },
  crew: {
    title: 'Crew',
    intro: 'Who is on which job each day, and whether their certifications are current.',
    bullets: ['Assign crew to jobs by day with the Assign button or by dragging', 'Expired certifications are flagged in red', 'Set availability (off or PTO) per day'],
  },
  notes: {
    title: 'Notes and To-dos',
    intro: 'Global notes, every to-do in one place, and a voice scratchpad.',
    bullets: ['Pin notes you need every day', 'Tag a note to a project or contact', 'Filter to-dos by today, overdue, upcoming or done', 'Tap the mic on the scratchpad and speak; the text appears as you talk'],
  },
  field: {
    title: 'Field app',
    intro: "The foreman's phone view: today's jobs, clock in and out, logs and photos.",
    bullets: ['Clock in on a job; location is recorded only if you allow it', 'Add a daily log in under a minute', 'Snap punch-list photos straight from the camera', 'Collect the client signature on site'],
  },
  client: {
    title: 'Client portal',
    intro: 'What your homeowner or tenant sees: their job only.',
    bullets: ['Schedule, progress photos and daily-log highlights', 'Approve change orders with a signature', 'Make selections from the checklist', 'View invoices and pay (demo)'],
  },
  invoices: {
    title: 'Invoicing',
    intro: 'Deposits, draws, finals and AIA-style pay applications.',
    bullets: ['Create a draw from a proposal payment schedule', 'Retainage is calculated per invoice', 'Pay applications include a schedule of values', 'Print any invoice'],
  },
  costing: {
    title: 'Job costing',
    intro: 'Estimate versus actual by category, margin per job, and the company P&L.',
    bullets: ['Add a cost entry to any job', 'Add your own cost categories', 'Switch the chart to a table'],
  },
  compliance: {
    title: 'Compliance vault',
    intro: 'Company and sub paperwork with expiry alerts.',
    bullets: ['Alerts at 60, 30 and 7 days, and when expired', 'An expired COI or license blocks a sub from being assigned', 'Upload documents up to 2 MB (demo)'],
  },
  docs: {
    title: 'Paperwork on demand',
    intro: 'Printable documents generated from your data.',
    bullets: ['Capability statement and prequal packet from the Company Brain', 'Proposals, change orders and invoices from projects', 'Lien waiver request checklist (actual waiver forms are state-specific)'],
  },
  ai: {
    title: 'AI assist',
    intro: 'Auto-fill, a message generator, and an assistant that answers questions about using the app.',
    bullets: ['A chip shows whether a result came from Live AI or the Demo generator', 'Every draft is editable before you use it', 'Log a generated message to the contact in one click'],
  },
  help: {
    title: 'Help Center',
    intro: 'Short answers to "How do I..." questions.',
    bullets: ['Search by keyword', 'Replay the setup tour from Settings'],
  },
  settings: {
    title: 'Settings',
    intro: 'Company profile, tax rate, price book, seats, notifications, sweep sources, and demo controls.',
    bullets: ['Simulate offline to see the save queue', 'Reset Demo restores the sample data', 'Replay the tour any time'],
  },
  sub: {
    title: 'Subcontractor view',
    intro: 'What your subs see: their jobs, paperwork uploads and bid invites.',
    bullets: ['Upload a COI or license to clear a block', 'Respond to invitations to bid'],
  },
}
