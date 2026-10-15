# Task: Rebuild https://visionarytalks.com/ai-people-to-watch/

You are rebuilding the "100 AI People to Watch in 2027" article on visionarytalks.com. The live version went through a template that stripped out the substance. Every entry is now about 100 words of abstract commentary, with no education, no career history and almost no numbers. Restore the full profiles, simplify the format, and fix the broken elements listed below.

Do not touch the URL. Keep `/ai-people-to-watch/`.

---

## 1. Source material

Use the attached file `ai-people-to-watch-2027.md` as the source of truth for content. It contains all 100 researched entries with education, career history, dated figures and source links. It also contains the intro, the "What the 100 tell me" analysis, the FAQ and the methodology section.

- Use only facts that are in that file or that you verify yourself from a primary or reputable source. Never invent schools, years, titles, quotes, funding figures or valuations.
- Where the source says "not verified" or "I could not verify", keep that honesty in the text or leave the fact out. Do not fill gaps with guesses.
- Delete every internal editorial note before publishing, for example "recheck it before print", "his title needs a check before print" and "Suggested URL". These were instructions to the editor, not copy.

---

## 2. What is wrong with the live page (do not repeat these)

1. **Entries are too thin.** About 100 words each, following the pattern: headline, two paragraphs, "My 2027 test", "What would weaken the case". No education. No career timeline. Almost no numbers. For example, Lovable has no ARR, Mercor no valuation and Physical Intelligence no funding.
2. **Every entry is built the same way.** Almost all open with "According to [X]'s biography/announcement, [X] identifies…". The second paragraph usually opens with "The business question concerns…" or "What matters next is…". Across 100 entries it reads like a machine.
3. **The language is abstract.** Examples to never write again:
   - "Commercial support can preserve an open project."
   - "Compatibility can be economically valuable even when it is less visible than a launch benchmark."
   - "Interviews are evidence of what someone says."
4. **Section names mean nothing to readers or to Google.** "What the records change", "Explore the bottlenecks", "Twelve files to start with", "The engineering behind useful intelligence", "Where the work meets the world", "Who sets the tests and shapes the decisions".
5. **The methodology lecture comes first.** The reader hits "A deal price is not a founder's net worth" before meeting a single person.
6. **Broken elements:**
   - The company-records table has merged labels: "$300Mfounding", "Not statedunknown", "$400M post-moneypost-money". It is also cut off at the Factory row.
   - Entry 84 (Beth Barnes) repeats the same point about the old time-horizon page in two paragraphs.
   - Entry 90 (Kai Zenner) is labeled "European Parliament" but cites an OECD biography. Use a source that matches the label, or relabel it.
   - The Wonderful entry's "Further records" link carries junk parameters: `?419=419419419419&scLang=ja`. Strip them.
   - There is no FAQ section, which loses FAQPage schema.
   - The "AI illustration" caption and alt text are duplicated in some entries (84 and 96).

---

## 3. New page structure (in this exact order)

1. **H1:** `100 AI People to Watch in 2027: The Engineers, Researchers and Founders Building What Comes Next`
2. **Byline and date line:** keep the existing author box and "Public records checked October 13, 2026".
3. **Intro:** the three short paragraphs from the source file, starting "The 100 people below aren't the ones you already know."
4. **H2: The 100 at a glance.** Keep the existing filterable index table (search and chapter filters are good, keep them). Columns: # · Name · Role and organization · Section. Every name links to its entry anchor.
5. **H2: Twelve to start with.** Keep the existing featured shortlist; only rename the section.
6. **H2: What the 100 tell me.** The five-pattern analysis from the source file, with the small section-count table.
7. **H2: Frontier AI researchers** (entries 1 to 21)
8. **H2: AI engineers building the infrastructure** (entries 22 to 41)
9. **H2: AI founders and builders** (entries 42 to 61)
10. **H2: Applied AI innovators, industry by industry** (entries 62 to 83)
11. **H2: AI safety, policy, investing and the people who explain it** (entries 84 to 100)
12. **H2: Frequently asked questions.** From the source file. Add FAQPage schema.
13. **H2: How I built this list.** The methodology bullets from the source file. Move the current "What the records change" points here, shortened to one bullet each.
14. **Company records table.** Optional; if kept, place it at the very end after fixing every merged label and the cut-off row.
15. **"Who am I missing?" nomination form.** Keep it, at the bottom.

Keep the existing illustrations. Each entry gets its illustration directly under the role line, with the caption written once.

---

## 4. Entry template (use for all 100)

Length: 150 to 220 words per entry, excluding the sources line.

```
### {N}. {Full Name}
**{Current role}, {Organization}** · {Section tag} · {City/country if known}

[illustration + caption "AI editorial illustration" once]

{Hook: 1 to 2 sentences. The single most concrete, impressive fact about this person, with a number or date where possible.}

**Education:** {Schools, degrees, years, notable advisors. If unknown: "I could not verify his/her education."}

**The path:** {3 to 5 sentences of career history in order, with years. Name the specific papers, models, products or deals and when they happened.}

**Why I'm watching in 2027:** {2 to 3 sentences. A concrete, dated reason: a new lab, a funding round, a launch, an IPO filing.}

**My read:** {1 to 2 sentences of analysis in the investigator voice. Put the risk or caveat here, the "what would weaken the case", as ONE sentence, not a separate section.}

**Sources:** [Source name](url) · [Source name](url)
```

Remove the "My 2027 test" and "What would weaken the case" labels completely. Their content is covered by "Why I'm watching in 2027" and "My read".

### Example of a correct entry

```
### 42. Anton Osika
**Co-founder and CEO, Lovable** · AI founders · Stockholm, Sweden

Lovable hit $4M ARR four weeks after its Nov 2024 launch and $200M by Dec 2025. Osika says it was tracking to a $600M run rate by end of Aug 2026 (company-reported, VKTR, Aug 12, 2026).

**Education:** BSc in Physics, Hong Kong University of Science and Technology; MSc in Engineering Physics and Applied Mathematics, KTH Royal Institute of Technology. I could not verify the years.

**The path:** He worked on CERN's ATLAS experiment, was an early engineer at Sana Labs and co-founded Depict.ai as CTO. In 2023 he released GPT-Engineer, an open-source side project that went viral on GitHub, then co-founded Lovable with Fabian Hedin. Lovable raised a $330M Series B at $6.6B (Dec 2025) and a $400M Series C at $13.3B led by Menlo Ventures (Aug 2026).

**Why I'm watching in 2027:** The climb toward a $1B run rate, an enterprise push (Adidas, NVIDIA, Deutsche Telekom) and new US offices.

**My read:** Keep the $13.3B valuation apart from his wallet: Forbes estimated he crossed $1B after the Dec 2025 round. The risk is apps that are quick to generate and expensive to maintain.

**Sources:** [VKTR](https://www.vktr.com/ai-platforms/lovable-raises-400-million-at-133-billion-valuation/) · [Forbes](https://www.forbes.com/sites/zoyahasan/2026/01/09/they-made-the-under-30-europe-list-now-theyre-billionaires-who-should-be-next/) · [KTH](https://www.kth.se/en/om/nyheter/centrala-nyheter/anton-osika-och-fabian-hedin-kth-innovation-award-2025-1.1425893)
```

### Example of what NOT to write (current live style)

```
Creating the app is only the beginning
According to KTH's 2025 innovation-award account, KTH identifies Anton Osika and Fabian Hedin as Lovable's founders...
I am watching what happens after the first working prototype.
My 2027 test: Show applications that remain useful through upgrades, maintenance and real customer traffic.
What would weaken the case: Rapid creation followed by high repair costs...
```

---

## 5. Writing rules

- **Voice:** first-person investigator, the same as the Leaders profiles ("I", "my read", "I could not verify"). Confident, concrete, warm. Not academic.
- **NEVER use em dashes (Unicode U+2014) or en dashes (U+2013).** Use commas, colons, periods or parentheses. Write ranges as "2019 to 2023".
- **Vary sentence openings.** No more than 3 entries in the whole article may start with "According to". Lead with the most interesting fact instead.
- **Every figure carries a date.** Company-reported numbers are labeled "company-reported". Rounds reported as talks are labeled "reported, not confirmed closed".
- **A company's valuation is never a person's net worth.** Use a personal figure only if Forbes or a similar outlet published one, with source and date.
- **Banned words:** visionary, trailblazer, game-changer, revolutionize, cutting-edge, unleash, testament, landscape, realm, "the business question concerns", "what matters next is".
- **Plain English over abstraction.** If a sentence has no name, number, date or product in it, rewrite it or cut it.

---

## 6. SEO

- **Title tag:** `100 AI People to Watch in 2027: Engineers, Researchers and Founders`
- **Meta description:** `100 AI researchers, engineers, founders and innovators to watch in 2027, with their education, career history, dated funding figures and sources.`
- **Section H2s** must keep the search terms: "AI researchers", "AI engineers", "AI founders", "AI innovators".
- **Schema:** Article + FAQPage. ItemList for the 100 people is a plus.
- **Internal links:** keep links to the Leaders profiles and "who owns" pages where the source file already links them (for example /who-owns-base44/, /who-owns-cohere/).

---

## 7. Verify before publishing

These items were flagged in research as possibly out of date. Check each one, then update or soften the wording:

- Jason Wei and Hongyu Ren: still at Meta Superintelligence Labs?
- Levent Alpöge: Anthropic or OpenAI? (Sources conflict. Say so if still unresolved.)
- Helen Toner: still interim executive director at CSET?
- Tri Dao: current Princeton title.
- Jerry Liu: current role at LlamaIndex (no 2026 source found).
- Alexander Wei: role confirmed only by his personal site.
- Any funding round marked "reported, not confirmed closed": check whether it has closed since Oct 13, 2026 (Physical Intelligence, Periodic Labs, Core Automation, Modal, Baseten, Etched, Mercor).

---

## 8. Done checklist (all must pass)

- [ ] 100 entries, numbered 1 to 100, in the five sections above
- [ ] Every entry has Education, The path, Why I'm watching in 2027, My read and Sources
- [ ] No "My 2027 test" or "What would weaken the case" labels anywhere
- [ ] No more than 3 entries start with "According to"
- [ ] Zero em dashes or en dashes on the page (search the page for U+2014 and U+2013)
- [ ] No editorial notes left in the copy ("before print", "Suggested URL", "check")
- [ ] Company-records table fixed (no merged labels, not cut off) or removed
- [ ] Beth Barnes duplicate paragraph removed; Kai Zenner source matches label; Wonderful link cleaned
- [ ] FAQ section present with FAQPage schema
- [ ] Each illustration caption appears once per entry
- [ ] Page reviewed at mobile width (390px): index table scrolls and filters work

When done, send me: the live URL, a list of every fact you changed during verification (old → new, with source), and any entry you could not complete.
