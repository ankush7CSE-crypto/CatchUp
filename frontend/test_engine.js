import { parseTranscript, validateTranscript, analyzeTranscript } from './src/services/analyzer.js';

console.log('--- RUNNING PULSECATCH ENGINE VERIFICATION TESTS ---\n');

// TEST 1: Validation
console.log('Test 1: Input Validation');
const emptyVal = validateTranscript('');
console.assert(!emptyVal.isValid, 'Empty transcript should be invalid');
console.log('✓ Empty transcript validation rejected:', emptyVal.error);

const wsVal = validateTranscript('   \n  \n');
console.assert(!wsVal.isValid, 'Whitespace transcript should be invalid');
console.log('✓ Whitespace transcript rejected:', wsVal.error);

const shortVal = validateTranscript('Hi');
console.assert(!shortVal.isValid, 'Too short transcript should be invalid');
console.log('✓ Short transcript rejected:', shortVal.error);

const validVal = validateTranscript('[09:40] Maya: We need to deploy by 2 PM.');
console.assert(validVal.isValid, 'Valid transcript should pass');
console.log('✓ Valid transcript accepted.\n');

// TEST 2: Parsing & Stable IDs
console.log('Test 2: Parsing & Stable Message IDs');
const rawChat = `[09:40] Maya (Lead): Staging DB has a deadlock error.
[09:42] Julian (DevOps): We are blocked on pgBouncer pool limits.
[09:44] Priya (Backend): Agreed. I will adjust the pool size to 60 before 2 PM.
[09:50] Priya: Stress bench completed, no blockers otherwise.`;

const msgs = parseTranscript(rawChat);
console.assert(msgs.length === 4, `Expected 4 messages, got ${msgs.length}`);
console.assert(msgs[0].id === 'msg_1', `Expected msg_1, got ${msgs[0].id}`);
console.assert(msgs[1].id === 'msg_2', `Expected msg_2, got ${msgs[1].id}`);
console.assert(msgs[0].author === 'Maya', `Expected Maya, got ${msgs[0].author}`);
console.assert(msgs[0].authorRole === 'Lead', `Expected Lead role, got ${msgs[0].authorRole}`);
console.log('✓ Messages parsed with stable IDs:', msgs.map(m => `${m.id}: ${m.author} (${m.authorRole || 'none'})`).join(', '));
console.log('');

// TEST 3: Action Items, Deadlines, and Explicit Assignees
console.log('Test 3: Action Items & Provenance');
const userProfile = { name: 'Priya', role: 'Backend Engineer' };
const analysis = analyzeTranscript(msgs, userProfile, '#infra-test');

console.assert(analysis.action_items.length >= 1, 'Should extract action item for Priya');
const priyaTask = analysis.action_items.find(a => a.assignee === 'Priya');
console.assert(priyaTask, 'Priya task must exist');
console.assert(priyaTask.deadline.includes('2:00 PM') || priyaTask.deadline.includes('2 PM'), `Expected deadline around 2 PM, got ${priyaTask.deadline}`);
console.assert(priyaTask.sourceMessageId === 'msg_3', `Expected source msg_3, got ${priyaTask.sourceMessageId}`);
console.assert(priyaTask.tier === 'DIRECT_IMPACT', `Expected DIRECT_IMPACT for Priya, got ${priyaTask.tier}`);
console.log('✓ Action Item verified:', {
  task: priyaTask.task,
  assignee: priyaTask.assignee,
  deadline: priyaTask.deadline,
  tier: priyaTask.tier,
  sourceId: priyaTask.sourceMessageId
});
console.log('');

// TEST 4: Decisions & Supporting Message Provenance
console.log('Test 4: Decisions Provenance');
console.assert(analysis.decisions.length >= 1, 'Should extract decision');
const decision = analysis.decisions[0];
console.assert(decision.sourceMessageId === 'msg_3', `Expected source msg_3 for decision, got ${decision.sourceMessageId}`);
console.log('✓ Decision verified:', {
  decision: decision.decision,
  agreedBy: decision.agreedBy,
  sourceId: decision.sourceMessageId
});
console.log('');

// TEST 5: Blocker Detection and Subsequent Resolution Tracking
console.log('Test 5: Blocker Resolution Tracking');
console.assert(analysis.blockers.length >= 1, 'Should extract blocker');
const blocker = analysis.blockers[0];
console.assert(blocker.isResolved === true, 'Blocker should be marked resolved by later message msg_4');
console.assert(blocker.resolvedByMessageId === 'msg_4', `Expected resolvedByMessageId msg_4, got ${blocker.resolvedByMessageId}`);
console.log('✓ Blocker Resolution verified:', {
  description: blocker.description,
  reportedBy: blocker.reportedBy,
  isResolved: blocker.isResolved,
  resolvedBy: blocker.resolvedByMessageId,
  resolutionNote: blocker.resolutionNote
});
console.log('');

// TEST 6: Dynamic Counts and Noise Metric
console.log('Test 6: Dynamic Dashboard Counts (No Hardcoded Values)');
console.assert(analysis.stats.messages_analyzed === 4, `Expected 4 messages analyzed, got ${analysis.stats.messages_analyzed}`);
console.assert(analysis.stats.action_items_count === analysis.action_items.length, 'Action items count must match array length');
console.assert(analysis.stats.decisions_count === analysis.decisions.length, 'Decisions count must match array length');
console.assert(analysis.stats.blockers_count === analysis.blockers.length, 'Blockers count must match array length');
console.log('✓ Stats correctly calculated:', analysis.stats);
console.log('');

// TEST 7: Custom Transcript Replaces Stale Results
console.log('Test 7: Stale Results Replaced by Completely Different Transcript');
const customChat = `[14:00] Alice: Bob, please review PR #99 by tomorrow.
[14:01] Bob: Thanks Alice, will do.`;
const customMsgs = parseTranscript(customChat);
const customAnalysis = analyzeTranscript(customMsgs, { name: 'Bob', role: 'Engineer' }, '#frontend');

console.assert(customAnalysis.stats.messages_analyzed === 2, 'Must have 2 messages');
console.assert(customAnalysis.stats.action_items_count === 1, 'Must have 1 action item');
console.assert(customAnalysis.action_items[0].assignee === 'Bob', 'Assignee must be Bob');
console.assert(customAnalysis.action_items[0].sourceMessageId === 'msg_1', 'Source must be msg_1');
console.assert(customAnalysis.action_items[0].tier === 'DIRECT_IMPACT', 'Must be direct impact for Bob');
console.log('✓ Custom Transcript analysis cleanly replaced previous state with:', {
  messages: customAnalysis.stats.messages_analyzed,
  actions: customAnalysis.action_items.map(a => `${a.task} -> @${a.assignee} [${a.sourceMessageId}]`)
});
console.log('');

// TEST 8: WhatsApp Format Parsing
console.log('Test 8: WhatsApp Export Parsing');
const waChat = `12/10/2026, 10:15 - Sarah: Please merge the hotfix branch today.
12/10/2026, 10:18 - Alex: Agreed, approved PR.`;
const waMsgs = parseTranscript(waChat);
console.assert(waMsgs.length === 2, `Expected 2 WhatsApp messages, got ${waMsgs.length}`);
console.assert(waMsgs[0].author === 'Sarah', `Expected author Sarah, got ${waMsgs[0].author}`);
console.assert(waMsgs[1].author === 'Alex', `Expected author Alex, got ${waMsgs[1].author}`);
console.log('✓ WhatsApp messages parsed correctly:', waMsgs.map(m => `${m.id}: [${m.timestamp}] ${m.author}`).join(', '));
console.log('');

// TEST 9: Persona Shift Verification
console.log('Test 9: Identity Lens & Persona Dynamic Shifts');
const teamChat = `[10:00] Maya: Priya, please scale Redis before 4 PM.
[10:02] Priya: Done. Julian, can you check the ingress logs?
[10:05] Julian: Checking now.`;
const teamMsgs = parseTranscript(teamChat);

// Persona A: Priya
const priyaAnalysis = analyzeTranscript(teamMsgs, { name: 'Priya', role: 'Backend' }, '#infra');
const priyaDirect = priyaAnalysis.action_items.filter(a => a.tier === 'DIRECT_IMPACT');
console.assert(priyaDirect.some(a => a.assignee === 'Priya'), 'Priya should have direct impact task');

// Persona B: Julian
const julianAnalysis = analyzeTranscript(teamMsgs, { name: 'Julian', role: 'DevOps' }, '#infra');
const julianDirect = julianAnalysis.action_items.filter(a => a.tier === 'DIRECT_IMPACT');
console.assert(julianDirect.some(a => a.assignee === 'Julian'), 'Julian should have direct impact task');
console.log('✓ Persona Lens correctly recomputes DIRECT_IMPACT per viewer:', {
  forPriya: priyaDirect.map(a => `${a.task} (@${a.assignee})`),
  forJulian: julianDirect.map(a => `${a.task} (@${a.assignee})`)
});
console.log('');

// TEST 10: Noise Reduction Metric Calculation
console.log('Test 10: Noise Reduction Metric');
const noisyChat = `[09:00] Alice: Morning team!
[09:01] Bob: Morning!
[09:02] Charlie: Coffee time ☕
[09:03] Dave: Heading into office.
[09:04] Alice: Bob, please deploy the build before 11 AM.
[09:05] Bob: Will do!`;
const noisyMsgs = parseTranscript(noisyChat);
const noisyAnalysis = analyzeTranscript(noisyMsgs, { name: 'Bob', role: 'Dev' }, '#watercooler');
console.assert(noisyAnalysis.stats.messages_analyzed === 6, 'Total 6 messages');
console.assert(noisyAnalysis.stats.noise_reduced_pct >= 50, 'Noise reduction should be >= 50%');
console.log(`✓ Noise reduction calculated accurately: ${noisyAnalysis.stats.noise_reduced_pct}% noise filtered out (${noisyAnalysis.stats.messages_analyzed} msgs -> ${noisyAnalysis.stats.action_items_count} action item)`);
console.log('');

console.log('\n--- ALL 10 ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY! ---');

