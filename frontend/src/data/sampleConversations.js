/**
 * Clearly Labeled Sample Chat Datasets for Testing & Demonstration
 */
export const SAMPLE_CONVERSATIONS = [
  {
    id: 'incident',
    title: '[Sample Dataset] #incident-db-failover',
    channel: '#incident-db-failover',
    tag: 'Sample: Incident Post-Mortem',
    tagType: 'error',
    description: '[Sample Data] 11 messages between DevOps & backend engineers regarding PostgreSQL connection pooling spike during EMEA peak hours.',
    metricsBadge: '4 action items • 2 decisions • 1 resolved blocker',
    activeUser: { name: 'Priya', role: 'Backend Engineer' },
    transcript: `[09:40] Maya (Lead): Team, alert triggered on staging & prod-replica. DB connection pool exhausted.
[09:41] Julian (DevOps): Staging DB had two deadlocks during the test run. We must patch pgBouncer pool limits before deployment.
[09:43] Priya (Backend): Investigating now. It looks like the new billing webhook query is holding transactions open for 14 seconds without indexing.
[09:45] Julian: Maya, should we rollback to v2.14 or apply a hotfix to pgBouncer config?
[09:46] Maya: Rollback will drop in-flight checkouts. Let's patch pgBouncer pool size immediately to buy breathing room.
[09:47] Priya: Agreed. I will adjust the pool size from 25 to 60 and rerun stress benches.
[09:49] Julian: I can deploy the config map change in 5 minutes once Priya confirms the bench parameters.
[09:51] Maya: Priya, can you send the sign-off doc to Alex once confirmed?
[09:53] Priya: Yes, targeted for 2 PM today. No blockers otherwise.
[09:55] Alex (Security): Reminder to ensure TLS verify remains strict on all socket connections during the patch.
[09:58] Julian: Confirmed, strict TLS cert validation enforced. Patching now.`
  },
  {
    id: 'sprint',
    title: '[Sample Dataset] #product-sprint-44',
    channel: '#product-sprint-44',
    tag: 'Sample: Sprint Planning',
    tagType: 'primary',
    description: '[Sample Data] 9 messages debating Q3 roadmap scope, Stripe webhook deprecation, and mobile onboarding experiment deadlines.',
    metricsBadge: '4 action items • 1 decision • 1 resolved blocker',
    activeUser: { name: 'Sarah', role: 'Frontend Lead' },
    transcript: `[10:00] Maya (Lead): Alright team, let's lock in Sprint 44 commitments. We have three epics competing for engineering bandwidth.
[10:02] Sarah (Frontend): The onboarding redesign is 80% done, but we are blocked on the updated OAuth redirect URI from backend.
[10:05] David (Backend): The OAuth patch is in PR #409. I will merge it by 11:30 AM today so Sarah can unblock staging verification.
[10:08] Maya: Great. What about the Stripe billing webhook migration? Stripe is deprecating the legacy endpoint on Thursday.
[10:11] David: We need to finalize the Stripe billing webhook migration by Thursday 5 PM.
[10:14] Sarah: I will audit the frontend checkout error states to handle any Stripe webhook retry delays.
[10:17] Maya: Agreed. Sarah handles checkout UI fallback, David owns webhook handler.
[10:20] Elena (QA): Can we freeze PR merges by Wednesday 4 PM so QA can run regression tests?
[10:22] Maya: Confirmed. Code freeze strictly Wednesday 4 PM.`
  },
  {
    id: 'design',
    title: '[Sample Dataset] #design-feedback-v2',
    channel: '#design-feedback-v2',
    tag: 'Sample: Design Review',
    tagType: 'surface',
    description: '[Sample Data] 7 messages reviewing the new design tokens, spacing scale, and prototype handoff to web & mobile developers.',
    metricsBadge: '2 action items • 2 decisions',
    activeUser: { name: 'Elena', role: 'Product Designer' },
    transcript: `[11:15] Elena (Designer): Handoff for the new dashboard cards is ready in Figma. I updated the color tokens to use slate navy and indigo accents.
[11:18] Marcus (Mobile): Looking at the spacing tokens. The gutter on mobile seems a bit tight at 12px.
[11:20] Elena: Good catch. Let's standardize on 16px gutter across both mobile and desktop.
[11:22] Sarah (Frontend): Are we using Plus Jakarta Sans for all UI headers or just hero displays?
[11:25] Elena: Plus Jakarta Sans for all UI headers and body; JetBrains Mono for code snippets, metadata, and timestamps.
[11:28] Marcus: Agreed. That gives developer tools a much sharper, clinical look.
[11:30] Elena: I will export the final token JSON and push it to the design-system repo before 3 PM today.`
  }
];
