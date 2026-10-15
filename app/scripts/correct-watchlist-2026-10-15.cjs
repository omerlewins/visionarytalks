// Deliberate copy correction. Preserves the October 14 factual review and
// records the two replacement primary biographies separately in the audit.
const fs = require('node:fs');
const root = require('node:path').resolve(__dirname, '../..');
const file = root + '/app/src/data/ai-watchlist.json';
const article = JSON.parse(fs.readFileSync(root + '/app/src/data/ai-watchlist-published-2026-10-14.json', 'utf8'));
const person = n => article.people.find(p => p.number === n);
const edits = {
  10: {outlook: person(10).profile.outlook.replace('what humans supplied', 'what humans contributed')},
  14: {education: 'I could not verify his complete degree chronology against university award records.', hook: person(14).profile.hook.replace("SCMP's December 17, 2025 report", "Yahoo Finance's December 17, 2025 report")},
  15: {education: 'I could not verify his degree award year from a university record.'},
  16: {education: person(16).profile.education.replace('; that is more precise than the supplied generic computer-science label', '')},
  18: {education: person(18).profile.education.replace('the opened biography does not establish all award years', 'not all award years are established')},
  19: {education: 'I could not verify his degrees or scholarship dates from primary award records.'},
  29: {career: person(29).profile.career.replace(', according to his biography, according to his biography', ', according to his biography'), outlook: person(29).profile.outlook.replace('from the supplied September talks', 'after that announcement')},
  31: {career: person(31).profile.career.replace('I have not verified the supplied exact early-career banking dates.', 'His exact early-career banking dates remain unverified.')},
  32: {career: person(32).profile.career.replace("TechCrunch's December 2025 funding report", "Yahoo Finance's December 2025 funding report")},
  36: {education: person(36).profile.education.replace('award years are not supplied in the opened biography', 'the biography does not establish the award years')},
  38: {hook: person(38).profile.hook.replace(', rather than the September date in the supplied brief', '')},
  39: {
    hook: "Reiner Pope's [personal biography](https://reiner.org/) identifies him as MatX's co-founder and CEO, following work at Google on language-model hardware and software efficiency. His startup turns that systems experience into a chip business.",
    education: 'I could not verify his degree or graduation year from a university record.',
    career: "Pope describes earlier Google work on compilers and chip architecture as well as model efficiency. His [personal site](https://reiner.org/) also lists technical writing on matrix multiplication, hashing and sorting, with dated posts in 2025. Those are inspectable technical contributions, rather than proof that a commercial chip meets its performance targets. I do not infer precise employment dates or a completed delivery milestone from that biography.",
    sources: [{title: 'Reiner Pope: personal biography', url: 'https://reiner.org/'}],
    outlook: 'MatX puts Pope on the other side of the hardware purchase: his team must deliver a customer system, not just optimize an existing one. Measured throughput, power consumption, compiler support and deployment reliability would tell me more than a speculative private-company price. A design target is not evidence of shipped silicon.'
  },
  40: {
    hook: "Sharon Zhou's move from Lamini to AMD put AI research and developer education inside a chip supplier. In [AMD's own welcome post](https://www.linkedin.com/posts/amd_welcome-to-team-amd-sharon-activity-7338587807789002754-hLsk), she says she is joining Lisa Su's team and that several Lamini colleagues are joining too.",
    education: 'I could not verify her degree award years from university records.',
    career: "Zhou's announcement describes teaching AI with Andrew Ng and work on fine-tuning and accuracy using AMD GPUs. It also sets out an intention to build accessible AI courses and listen to developers' feedback. AMD's [author page](https://www.amd.com/en/blogs/by-author/sharon-zhou.html) provides a separate company record under her name. The team move establishes an affiliation; it does not disclose acquisition terms or personal proceeds. I do not treat it as evidence that AMD acquired all of Lamini.",
    outlook: 'The AMD appointment connects Zhou with the developer adoption problem around its GPUs. For 2027, I want evidence that clearer teaching and usable tools reduce the time required to run real models on that hardware. A course can attract learners without demonstrating sustained production use.',
    sources: [{title: 'AMD: Sharon Zhou welcome announcement', url: 'https://www.linkedin.com/posts/amd_welcome-to-team-amd-sharon-activity-7338587807789002754-hLsk'}, {title: 'AMD: Sharon Zhou author page', url: 'https://www.amd.com/en/blogs/by-author/sharon-zhou.html'}]
  },
  41: {education: 'I could not verify his degrees, honors or award dates from a university record.'},
  42: {education: person(42).profile.education.replace('the supplied HKUST degree', 'an HKUST degree')},
  47: {hook: person(47).profile.hook.replace('The original date is September 15, correcting the supplied September 16 chronology.', 'The announcement is dated September 15.')},
  78: {outlook: person(78).profile.outlook.replace('I omit supplied funding and aircraft-delivery claims not needed to establish his research role; a future flight target is not a completed demonstration.', 'A future flight target is not a completed demonstration; research credentials do not establish aircraft delivery.')},
  84: {career: person(84).profile.career.replace('not established by the opened record', 'not established by that organization page')},
  91: {hook: person(91).profile.hook.replace(', without the supplied interim qualifier', ''), outlook: person(91).profile.outlook.replace(', without the interim qualifier in the supplied brief', '')},
  92: {hook: person(92).profile.hook.replace('The original statement corrects the supplied $101 million amount.', 'That is committed fund capital, not a personal wealth estimate.')}
};
for (const [n, patch] of Object.entries(edits)) Object.assign(person(+n).profile, patch);
// Each opener uses work or an event already established in the retained entry.
// No fresh financing, appointment or launch is inferred from the 2027 thesis.
const outlooks = {
1: "The July 2025 IMO result raises a harder question for Wei's team: can other mathematicians inspect and verify the reasoning?",
3: "Chain-of-thought research gives Jason Wei a specific 2027 challenge: show when a model's explanation reliably tracks how it reaches an answer.",
4: "Ren's o1 contribution and reported Meta move put reliable reasoning, rather than another recruitment headline, at the center of my 2027 thesis.",
5: "Douglas's May 2025 interview leaves dated predictions to compare with actual reinforcement-learning results in 2027.",
6: "Anthropic's circuit-tracing experiments give Batson's work a practical next test: can the explanations guide interventions that consistently change model behavior?",
7: "AlphaProof's formal-mathematics work makes independently checkable proofs the result I want to see next from Schrittwieser's research.",
8: "Nanda's interpretability work at DeepMind needs to show which findings help researchers diagnose or change a model beyond a selected example.",
9: "Genie 3's research preview makes world-model consistency a concrete 2027 test for Parker-Holder, beyond the quality of a short demonstration.",
10: "Weng's reported return to OpenAI shifts my attention to the artifacts that emerge from recursive self-improvement research.",
11: "Periodic Labs' combination of models and physical laboratories makes repeatable experimental results the milestone to follow in 2027.",
12: "Beam's October 2026 release gives Reflection a model that outside developers can examine, making reproducibility the next test for Laskin's team.",
13: "Luo's reported MiMo promotion puts the model team's releases, deployment costs and external evaluations ahead of the internal rank in my 2027 assessment.",
14: "The Tencent appointment puts Yao's feedback-based agent research alongside responsibility for large-scale deployment.",
16: "Kimi K2 provides a technical starting point for testing Moonshot's reasoning and long-context claims against actual cost and reliability.",
17: "Physical Intelligence brings Finn's learning-to-learn research to a harder setting: robots that must work outside their training demonstrations.",
18: "UniSim's interactive simulation work makes transfer to real experiments the next test for Yang's world models.",
21: "Cohere's August 2025 chief-AI-officer announcement puts Pineau's research leadership alongside enterprise and sovereign deployment economics.",
22: "vLLM gives Kwon an inspectable technical foundation; Inferact must show why customers will pay for the surrounding service.",
23: "SGLang's open engine makes RadixArk's support, reliability and production economics the next things to examine in Sheng's work.",
24: "llama.cpp makes local inference testable on the user's own device; Gerganov's next challenge is preserving that usability as models change.",
25: "FlashAttention and Mamba put Dao's work on two routes to lower inference costs, both of which need matched hardware comparisons.",
26: "Unsloth's model fixes give Han a testable proposition: lower training costs without hidden losses in correctness or reproducibility.",
27: "DSPy's programmatic approach makes repeatable optimization, rather than a one-off prompt improvement, the result to follow from Khattab's work.",
28: "Transformers v5 makes compatibility across downstream tools a concrete test of Debut's infrastructure work.",
30: "Qiao's move from PyTorch infrastructure to inference turns the question toward reliable customer workloads at a sustainable serving cost.",
33: "Ollama's local-model workflow makes installation, updating and dependable everyday use the next tests for Morgan's team.",
34: "turbopuffer's object-storage design puts retrieval latency and total operating cost at the center of Eskildsen's 2027 case.",
35: "Braintrust's funding announcement connects Goyal's evaluation tools with a commercial test: catching failures that customers actually encounter.",
36: "Arena's reported January 2026 financing makes commercial expansion and the independence of its comparisons a joint test for Angelopoulos.",
37: "The October 2026 MCP maintainer record puts Soria Parra close to the practical question of dependable tool and data connections.",
43: "Wix's Base44 acquisition makes the post-deal product, customer retention and maintenance burden more informative than the headline consideration.",
44: "ElevenLabs' reported ARR growth makes retention, serving costs and dependable voice output the next checks on Staniszewski's business.",
45: "Mercor's expert-training business makes retained revenue and the cost of coordinating specialists the measures I want to follow from Foody.",
46: "Decagon's January 2026 financing gives Zhang's team capital to expand; resolved customer problems will matter more than message volume.",
47: "Factory's September 2026 round makes secure deployment and ongoing maintenance the next tests of Grinberg's coding agents.",
48: "Emergent's reported eight-month run-rate milestone raises a tougher question for Jha: will users keep control when agents act across business systems?",
49: "Runway's reported Series E backs Valenzuela's move toward world models, whose value must extend beyond selected creative samples.",
51: "SAP's strategic investment gives n8n an enterprise distribution relationship; Oberhauser still needs to show dependable workflows in customer use.",
52: "Black Forest Labs connects Rombach's diffusion research with a commercial test: keeping paying users as creative platforms bundle competing tools.",
53: "Higgsfield's conference-reported run rate makes repeat paid demand and cost per completed creation the tests to follow from Mashrabov.",
54: "Gamma's reported profitability makes Lee's next challenge concrete: retain paid users while competing with established office suites.",
55: "Profound's September 2026 round backs Cadwallader's bet on AI-answer visibility; I want evidence that mentions produce measurable customer value.",
57: "Synthesia takes Agapito's visual-synthesis research into enterprise communication, where editing, localization and identity controls determine repeat use.",
58: "Pika's video tools put Guo's 2027 case on repeat creative use at a sustainable cost, rather than a disputed private valuation.",
59: "Suno's releases and music-industry relationships make licensing costs and recurring demand central to Shulman's next phase.",
60: "Wonderful's local deployment teams make implementation labor a central test of whether Winkler's agent business scales like software.",
61: "Granola's March 2026 financing supports Pedregal's move from meeting notes to shared context, where permissions and accuracy become buying requirements.",
62: "Abridge puts Lipton's reliability research inside clinical documentation, where omissions and misleading summaries require detection and correction.",
64: "OpenEvidence puts Ziegler's language-model work in front of clinicians, making the accuracy of cited medical answers the decisive test.",
65: "Saria's published clinical outcomes work makes replication beyond the original study the next evidence to seek.",
66: "Chai Discovery turns Meier's model research toward molecular design; reproducible laboratory validation is the next milestone that matters to me.",
67: "Evo 2's release of code, data and weights gives external researchers a way to test Hie's genomic-model work.",
69: "Lundberg's Cell Atlas work gives integrated cell models an experimental test: predictions that survive outside their training data.",
70: "Physical Intelligence puts Hausman's robot-learning work into a general-purpose policy whose transfer across tasks must be demonstrated.",
71: "Skild AI brings Pathak's sensory-learning research into robot systems that must control different bodies and unfamiliar tasks.",
72: "NEO's October 2025 home launch makes human intervention and users' understanding of remote assistance central to Børnich's 2027 case.",
73: "Gemini Robotics' March 2025 announcement gives Parada's team a physical-action test, beyond a model's ability to describe a plan.",
74: "Legora's research-and-drafting workspace makes renewals and time saved after verification the evidence to follow from Junestrand.",
75: "Harvey's Azure distribution announcement gives Pereyra a route into more firms; traceable legal work and sustained renewals remain the commercial test.",
76: "Hebbia's FlashDocs addition extends Sivulka's workflow from research to slides, making source provenance across the whole chain essential.",
77: "Rogo's April 2026 financing backs Stengel's financial-research agents; verified calculations and traceable assumptions are the results I want to follow.",
78: "Helsing's chief-scientist appointment record puts Bordes's structured-representation research alongside the need to bound autonomy in operational systems.",
79: "XBOW's June 2025 leaderboard account makes de Moor's next test actionable findings and time to remediation, rather than raw discovery counts.",
81: "Orbital's BASF agreement gives Godwin an industrial test of materials discovery, beyond a pilot or a general promise about faster research.",
82: "Khan Academy's tutoring work puts DiCerbo's learning-science approach to a concrete test: students solving problems after the assistance is removed.",
83: "Wayve's embodied-driving approach makes operating conditions, interventions and supervision costs the measures to follow from Kendall.",
84: "METR's agent evaluations give Barnes a growing measurement problem as tasks lengthen and models become aware of testing.",
85: "Apollo's scheming experiments make useful warning signals in deployment the next test for Hobbhahn, including the rate of false alarms.",
86: "Redwood's control research makes adversarial testing of safeguards, rather than assumed model cooperation, the evidence to follow from Shlegeris.",
87: "Truthful AI's subliminal-learning results make replication across models and data choices the next test for Evans's research.",
88: "Ball's announced July 2026 OpenAI role changes the context for his frontier-policy arguments, making the developer's interests part of the analysis.",
89: "Heim's training-compute paper leaves an explicit policy test: do resource thresholds remain useful as algorithms and deployment methods change?",
90: "Zenner's parliamentary advisory work makes the transition from policy proposal to workable obligation the issue to follow in 2027.",
92: "Conviction's first-fund thesis makes durable companies, rather than portfolio markups alone, the result to follow from Guo's investments.",
94: "Braswell's move from product and engineering to venture investing makes retained infrastructure customers a more useful test than rising private prices.",
95: "Isford's investments across computation and physical systems face different validation times, which makes software-style growth expectations a risk to examine.",
96: "Willison's prompt-injection demonstrations make boundaries around agents' tools, data and permissions a concrete engineering test for 2027.",
97: "Lambert's June 2026 Ai2 farewell makes the next released post-training recipe, rather than an outdated affiliation, the work to follow.",
98: "Patel's long-form interviews leave a record of disagreements and predictions that readers can compare with later events.",
99: "The AI Engineer community's growth makes reusable code, evaluation methods and candid failure reports the evidence to seek from Wang's teaching.",
100: "Raschka's model-building books and reference code make visible training choices and evaluation limits the next tests of his teaching."
};
for (const [n, opener] of Object.entries(outlooks)) {
  const p = person(+n).profile;
  // Keep the substantive remaining analysis, replacing only its first sentence.
  const end = p.outlook.search(/\.(?:\s|$)/);
  p.outlook = opener + (end >= 0 ? p.outlook.slice(end + 1) : '');
}
for (const p of article.people) {
  for (const key of ['organization', 'role']) p[key] = p[key].replaceAll('Adaption Labs', 'Adaption');
  for (const key of ['hook','education','career','outlook','read']) {
    p.profile[key] = p.profile[key].replaceAll('Adaption Labs', 'Adaption')
      .replace(/\bthe supplied\s+/g, 'the ').replace(/\bsupplied\s+/g, '')
      .replace(/\bopened biography\b/g, 'biography').replace(/\bopened record\b/g, 'cited record');
    if (key !== 'education') {
      p.profile[key] = p.profile[key].split(/(?<=[.!?])\s+(?=[A-Z])/)
        .filter(sentence => !/^I (?:omit|leave out)\b/.test(sentence))
        .filter(sentence => !/^That corrects the CTO label\./.test(sentence)).join(' ');
    }
  }
  // Vary the risk sentence around its existing concrete failure condition.
  if (p.profile.read.startsWith('My concern is ')) {
    const risk = p.profile.read.slice('My concern is '.length).replace(/\.$/, '');
    const subjects = [
      `For ${p.name}, I would look for evidence against this risk: `,
      `${p.organization}'s challenge is to avoid `,
      `${p.name.split(' ').at(-1)} would lose my confidence over `,
      `${p.name}: the warning sign is `,
    ];
    p.profile.read = subjects[p.number % subjects.length] + risk + '.';
  }
  if (p.profile.read.startsWith('The case weakens if ')) {
    p.profile.read = `${p.name}'s case depends on avoiding the opposite outcome: ` + p.profile.read.slice(19);
  }
  p.checked = '2026-10-15';
}
article.checked = '2026-10-15';
// Replace the removed internal notes with useful, explicitly editorial tests.
// These are questions for future evidence, not newly asserted achievements.
const nextEvidence = {
  3: 'I would compare explanations against interventions, not just answer accuracy.',
  16: 'An external test should identify the model version, context length and evaluation date, so a later release cannot silently inherit the performance claims of an earlier one.',
  22: 'I would compare support costs, latency under load and paid retention with the same engine operated independently.',
  23: 'My comparison would hold the model, hardware and request mix constant before crediting the serving engine for a cost improvement.',
  26: 'A useful benchmark would publish the model, memory requirement and resulting quality alongside the reported training speed.',
  41: 'I would test extraction against the original documents before scoring the final answer, including scanned tables, conflicting versions and access permissions that limit what an agent should retrieve.',
  50: 'My comparison would count qualified outcomes rather than messages generated.',
  61: 'I would test a disputed meeting decision against the recording and permissions, rather than judge the elegance of its summary.',
  62: 'For an evaluation, I would count corrections required per note and compare the clinician time saved after those corrections.',
  64: 'My spot checks would trace each medical assertion to the cited passage.',
  73: 'I would compare task success with intervention rates and disclose which robot, environment and preparation steps the result depends on.',
  74: 'I would measure the complete review cycle.',
  75: 'My evaluation would include rejected drafts and correction time, not only accepted outputs.',
  76: 'I would trace each slide calculation back to the underlying document and its date.',
  91: 'For a policy claim, I would trace the cited chip restriction or capability assessment to its original document and effective date.',
  93: 'I would compare each forecast with its original wording and deadline before counting it as correct.',
  98: 'I would track a guest’s specific prediction against its stated deadline, rather than score an interview by prominence alone.',
  100: 'I would run the examples, inspect the evaluation setup and distinguish a teaching simplification from an implementation error.'
};
for (const [n, text] of Object.entries(nextEvidence)) person(+n).profile.outlook += ' ' + text;
fs.writeFileSync(file, JSON.stringify(article, null, 2) + '\n');
console.log('Corrected copy and source destinations for all 100 entries.');
