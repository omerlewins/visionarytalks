// Draft copy for /youngest-billionaires/. Single source for the Preview route
// and growth/money/youngest-billionaires/ARTICLE.md (regenerate with
// `npx tsx scripts/render-youngest-billionaires-article.ts`).
// Every figure is Forbes' 1 March 2026 snapshot unless a sentence dates it otherwise.
export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "ol" | "ul"; items: string[] }
  | { type: "map" }
  | { type: "ranking" };

const forbes =
  "https://www.forbes.com/sites/simonemelvin/2026/03/10/the-worlds-youngest-billionaires-2026/";
const facts =
  "https://www.forbes.com/sites/chasewithorn/2026/03/10/2026-worlds-billionaires-list-facts-and-figures/";
const brasil =
  "https://economicnewsbrasil.com.br/2026/08/28/bilionaria-mais-jovem-do-mundo-amelie-voigt/";
const pew =
  "https://www.pewresearch.org/short-reads/2019/01/17/where-millennials-end-and-generation-z-begins/";

export const youngestBillionairesArticle = {
  path: "/youngest-billionaires/",
  title: "The Youngest Billionaires in the World (2026)",
  seoTitle: "Youngest Billionaires in the World 2026: All 35 Under 30",
  description:
    "The youngest billionaire is Amelie Voigt Trejes, 20, worth $1.1B on Forbes' 2026 list (as of 1 March 2026). All 35 under-30 billionaires, mapped and ranked.",
  dek: "All 35 under-30 billionaires on Forbes' 2026 list, mapped by citizenship and ranked by age. Ages and net worths as of 1 March 2026.",
  status: "draft" as const,
  blocks: [
    {
      type: "p",
      text: "The youngest billionaire in the world is Amelie Voigt Trejes, a 20-year-old Brazilian heir to the WEG industrial machinery fortune, worth $1.1 billion on Forbes' 2026 list (ages and net worths as of 1 March 2026). The youngest self-made billionaires are Mercor's three co-founders, Surya Midha, Brendan Foody and Adarsh Hiremath, each 22 and each worth $2.2 billion on the same date.",
    },
    {
      type: "p",
      text: `I went through every entry in [Forbes' World's Youngest Billionaires 2026](${forbes}), published 10 March 2026. Forbes counted a record 35 billionaires under 30 as of 1 March 2026, out of 3,428 billionaires in total, according to its [2026 facts and figures](${facts}). Together the 35 held $92.4 billion on that date. I checked each age and net worth against two secondary pages that cite the same Forbes data and found no numeric disagreement. This is a March 2026 snapshot, not a live October 2026 figure, and some people on it may have had birthdays since.`,
    },
    {
      type: "h2",
      id: "map",
      text: "Where are the youngest billionaires from?",
    },
    {
      type: "p",
      text: "Counted by citizenship, the 35 come from 12 countries as of 1 March 2026. The United States leads with 8, then Germany with 7 and Brazil with 6. Select a country on the map, or use the picker, to see who is behind each number.",
    },
    { type: "map" },
    {
      type: "p",
      text: "The map counts passports, not addresses. Firoz and Zahan Mistry are Irish citizens whose fortune comes from a stake in India's Tata Sons, so they sit under Ireland. Luana Lopes Lara is Brazilian and lives in the US, per Forbes. If you want residence inside America instead, my [map of billionaires by state](/how-many-billionaires-by-state/) uses a different, July 2025 dataset.",
    },
    {
      type: "h2",
      id: "youngest-billionaire",
      text: "Who is the youngest billionaire in the world?",
    },
    {
      type: "p",
      text: "Amelie Voigt Trejes is the youngest billionaire in the world on Forbes' 2026 list. She was 20 as of 1 March 2026, worth $1.1 billion through a stake of about 2% in WEG, the Brazilian industrial machinery company. She is one of five WEG heirs on the under-30 list, alongside the twins Pedro and Felipe Voigt Trejes and the sisters Livia and Dora Voigt de Assis.",
    },
    {
      type: "p",
      text: "Johannes von Baumbach of Germany was also 20 on 1 March 2026 and is far richer, at $6.6 billion from a stake in drugmaker Boehringer Ingelheim. Forbes calls him the second-youngest, so I keep its order: the source does not publish birth dates, and I could not verify them independently.",
    },
    {
      type: "p",
      text: `One dated caveat. Forbes Brasil's August 2026 survey, priced at 30 June 2026 and [reported by Economic News Brasil on 28 August 2026](${brasil}), put Voigt Trejes at R$6.7 billion and age 21. That is a different reference date and currency, with no US dollar figure published, so I do not mix it into the ranking.`,
    },
    {
      type: "h2",
      id: "top-10",
      text: "Who are the top 10 youngest billionaires?",
    },
    {
      type: "p",
      text: "These are the 10 youngest billionaires in the world, by age as of 1 March 2026, with Forbes' net worth on the same date. Ties at the same age keep the order in my dataset, which reverses Forbes' oldest-to-youngest article order.",
    },
    {
      type: "ol",
      items: [
        "Amelie Voigt Trejes, 20, $1.1B, WEG (Brazil, inherited)",
        "Johannes von Baumbach, 20, $6.6B, Boehringer Ingelheim (Germany, inherited)",
        "Livia Voigt de Assis, 21, $1.4B, WEG (Brazil, inherited)",
        "Clemente Del Vecchio, 21, $6.8B, Delfin / EssilorLuxottica (Italy, inherited)",
        "Kim Jung-youn, 22, $1.7B, Nexon (South Korea, inherited)",
        "Surya Midha, 22, $2.2B, Mercor (United States, self-made)",
        "Brendan Foody, 22, $2.2B, Mercor (United States, self-made)",
        "Adarsh Hiremath, 22, $2.2B, Mercor (United States, self-made)",
        "Kevin David Lehmann, 23, $4.9B, dm-drogerie markt (Germany, inherited)",
        "Pedro Voigt Trejes, 23, $1.1B, WEG (Brazil, inherited)",
      ],
    },
    {
      type: "p",
      text: "Pedro's twin, Felipe Voigt Trejes, is also 23 and also worth $1.1 billion as of 1 March 2026; he is 11th only because of that tie order. The top 10 held $30.2 billion combined on that date, and only three of them, the Mercor founders, are self-made.",
    },
    {
      type: "h2",
      id: "ranking",
      text: "All 35 billionaires under 30, ranked",
    },
    {
      type: "p",
      text: "Sort the full list by age, net worth, country or wealth type. Every figure in the table is as of 1 March 2026.",
    },
    { type: "ranking" },
    {
      type: "h2",
      id: "youngest-self-made",
      text: "Who is the youngest self-made billionaire?",
    },
    {
      type: "p",
      text: "The youngest self-made billionaires are Surya Midha, Brendan Foody and Adarsh Hiremath, the co-founders of AI software company Mercor. Each was 22 and worth $2.2 billion as of 1 March 2026. Forbes names Midha the world's youngest self-made billionaire; with no birth dates published, I list the three together.",
    },
    {
      type: "p",
      text: "The other self-made fortunes on the March 2026 list come from the same two places: AI software and prediction markets. Cursor's co-founders Michael Truell and Aman Sanger (both 25), Sualeh Asif and Arvid Lunnemark (both 26) were each worth $1.3 billion. Lovable's Fabian Hedin, 26, had $1.6 billion. Polymarket's Shayne Coplan, 27, had $1.0 billion. Scale AI founder Alexandr Wang, 29, had $3.2 billion, and Kalshi co-founders Tarek Mansour and Luana Lopes Lara, both 29, had $1.3 billion each. Forbes calls Lopes Lara the youngest self-made woman billionaire.",
    },
    {
      type: "p",
      text: "I have traced one of these fortunes in depth in my [Michael Truell net worth](/michael-truell-net-worth/) file. For how I weigh the evidence and limits behind an AI investor's estimated fortune, see my [Daniel Gross net worth](/daniel-gross-net-worth/) investigation. Startup valuations have moved since March 2026, and I have not re-verified these fortunes against later rounds, so treat them as March figures.",
    },
    {
      type: "h2",
      id: "gen-z",
      text: "Are there any Gen Z billionaires?",
    },
    {
      type: "p",
      text: `Yes. Using [Pew Research Center's definition](${pew}) of Gen Z as anyone born in 1997 or later, at least 29 of the 35 under-30 billionaires are Gen Z. Everyone aged 28 or younger on 1 March 2026 was born after 1 March 1997. The six who were 29 on that date could have been born in 1996 or early 1997, and the sources I opened do not publish birth dates, so I do not count them.`,
    },
    {
      type: "p",
      text: "Of those 29 Gen Z billionaires, 9 are self-made as of 1 March 2026: the three Mercor founders, the four Cursor co-founders, Fabian Hedin and Shayne Coplan. The rest inherited. For what typical US household wealth looks like by age, see my guide to [net worth by age](/net-worth-by-age/).",
    },
    {
      type: "h2",
      id: "inherited-vs-self-made",
      text: "Inherited vs self-made",
    },
    {
      type: "p",
      text: "Inheritance still dominates. As of 1 March 2026, 23 of the 35 under-30 billionaires inherited their fortunes and 12 are self-made. The inherited group held $72.2 billion, against $20.2 billion for the self-made group, and its median net worth was $1.9 billion against $1.3 billion.",
    },
    {
      type: "p",
      text: "Age splits the two groups cleanly. Of the 15 people under 25 on 1 March 2026, 12 inherited; the only self-made billionaires that young are the three Mercor founders. Family clusters account for much of the inherited side: five WEG heirs from Brazil, and four members of Germany's von Baumbach family, whose Boehringer Ingelheim stakes came to $26.4 billion between them.",
    },
    {
      type: "p",
      text: "Nationality splits them too. All eight US citizens on the list are self-made as of 1 March 2026, while every under-30 billionaire from Germany, Italy, Ireland, South Korea, France, Norway, China and the UAE is classed as inherited. One borderline case: Abbas Sajwani founded AHS Properties in 2021, but Forbes does not mark him self-made because he is the son of DAMAC founder Hussain Sajwani, so I label him inherited.",
    },
    {
      type: "h2",
      id: "richest-kid",
      text: "Who is the richest kid in the world?",
    },
    {
      type: "p",
      text: "Forbes' 2026 list has no one under 20, so it cannot name a billionaire child or teenager. The youngest people on it were 20 as of 1 March 2026. The richest of those two 20-year-olds is Johannes von Baumbach, at $6.6 billion. The richest person under 30 is a tie between Clemente Del Vecchio, 21, and Luca Del Vecchio, 24, each worth $6.8 billion on the same date through a stake of about 12.5% in Delfin, the holding company tied to EssilorLuxottica.",
    },
    {
      type: "h2",
      id: "method",
      text: "Method",
    },
    {
      type: "ul",
      items: [
        `List date: [Forbes' World's Youngest Billionaires 2026](${forbes}), published 10 March 2026 and updated 17 March 2026, with net worths as of 1 March 2026. Research checked 16 October 2026.`,
        "Ages are ages at the list date, 1 March 2026, as Forbes reported them. Some people may have had birthdays since.",
        "Inherited means not marked self-made by Forbes. I follow Forbes' self-made flag and do not reclassify anyone.",
        "Ties at the same age are ordered as in my dataset, which reverses Forbes' oldest-to-youngest article order. Forbes does not publish birth dates, so I could not verify the order within an age.",
        "Countries are citizenship, not residence. Net worths are Forbes' US dollar estimates on 1 March 2026; I did not use Bloomberg figures.",
        "I cross-checked every figure against two secondary pages that republish the Forbes data, ValueAddVC and Visual Capitalist. No numbers disagreed; I use Forbes' spelling of names where Visual Capitalist differs.",
      ],
    },
  ] satisfies ArticleBlock[],
  sources: [
    {
      id: "forbes-youngest",
      title: "The World's Youngest Billionaires 2026: 35 Under 30",
      url: forbes,
      publisher: "Forbes, Simone Melvin",
      publishedAt: "10 March 2026, updated 17 March 2026",
      evidence:
        "Ages, net worths, sources of wealth and self-made flags as of 1 March 2026.",
    },
    {
      id: "forbes-facts",
      title:
        "Inside Forbes' 2026 Billionaires List: More Than 3,400 Worth $20 Trillion",
      url: facts,
      publisher: "Forbes, Chase Peterson-Withorn",
      publishedAt: "10 March 2026",
      evidence: "Record 3,428 billionaires and 35 under 30 as of 1 March 2026.",
    },
    {
      id: "valueaddvc",
      title: "Youngest Billionaires 2026: All 35 Under 30 on the Forbes List",
      url: "https://valueaddvc.com/tools/forbes-under30-billionaires",
      publisher: "ValueAddVC",
      publishedAt: "Accessed 16 October 2026",
      evidence:
        "Secondary cross-check of the Forbes figures; no disagreements.",
    },
    {
      id: "visual-capitalist",
      title: "Ranked: The Youngest Billionaires in 2026",
      url: "https://www.visualcapitalist.com/cp/ranked-the-youngest-billionaires-in-2026/",
      publisher: "Visual Capitalist",
      publishedAt: "18 May 2026",
      evidence:
        "Secondary cross-check of the Forbes figures; no disagreements.",
    },
    {
      id: "economic-news-brasil",
      title: "Brasileira de 21 anos e a bilionaria mais jovem do mundo",
      url: brasil,
      publisher: "Economic News Brasil",
      publishedAt: "28 August 2026",
      evidence:
        "Forbes Brasil survey priced 30 June 2026: R$6.7 billion, age 21.",
    },
    {
      id: "pew",
      title:
        "Defining generations: Where Millennials end and Generation Z begins",
      url: pew,
      publisher: "Pew Research Center",
      publishedAt: "17 January 2019",
      evidence: "Gen Z defined as born 1997 or later.",
    },
  ],
};
