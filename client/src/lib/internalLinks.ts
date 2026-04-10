export interface F1Term {
  term: string;
  url: string;
}

export interface LinkToken {
  term: string;
  url: string;
  key: string;
}

export type ContentPart = string | LinkToken;

const F1_TERMS: F1Term[] = [
  { term: "championship standings", url: "/standings" },
  { term: "driver standings", url: "/standings" },
  { term: "constructor standings", url: "/standings?tab=constructors" },
  { term: "standings", url: "/standings" },
  { term: "F1 quiz", url: "/quiz" },
  { term: "race forum", url: "/forum" },
  { term: "Gina Voss", url: "/novel" },

  { term: "Max Verstappen", url: "/standings" },
  { term: "Verstappen", url: "/standings" },
  { term: "Lewis Hamilton", url: "/standings" },
  { term: "Hamilton", url: "/standings" },
  { term: "Lando Norris", url: "/standings" },
  { term: "Norris", url: "/standings" },
  { term: "Charles Leclerc", url: "/standings" },
  { term: "Leclerc", url: "/standings" },
  { term: "Carlos Sainz", url: "/standings" },
  { term: "Sainz", url: "/standings" },
  { term: "George Russell", url: "/standings" },
  { term: "Oscar Piastri", url: "/standings" },
  { term: "Piastri", url: "/standings" },
  { term: "Fernando Alonso", url: "/standings" },
  { term: "Alonso", url: "/standings" },
  { term: "Kimi Antonelli", url: "/standings" },
  { term: "Antonelli", url: "/standings" },
  { term: "Yuki Tsunoda", url: "/standings" },
  { term: "Tsunoda", url: "/standings" },
  { term: "Alex Albon", url: "/standings" },
  { term: "Albon", url: "/standings" },
  { term: "Lance Stroll", url: "/standings" },
  { term: "Stroll", url: "/standings" },
  { term: "Pierre Gasly", url: "/standings" },
  { term: "Gasly", url: "/standings" },
  { term: "Nico Hülkenberg", url: "/standings" },
  { term: "Hulkenberg", url: "/standings" },
  { term: "Esteban Ocon", url: "/standings" },
  { term: "Ocon", url: "/standings" },
  { term: "Oliver Bearman", url: "/standings" },
  { term: "Bearman", url: "/standings" },
  { term: "Isack Hadjar", url: "/standings" },
  { term: "Hadjar", url: "/standings" },

  { term: "Red Bull Racing", url: "/standings?tab=constructors" },
  { term: "Red Bull", url: "/standings?tab=constructors" },
  { term: "McLaren", url: "/standings?tab=constructors" },
  { term: "Ferrari", url: "/standings?tab=constructors" },
  { term: "Mercedes", url: "/standings?tab=constructors" },
  { term: "Aston Martin", url: "/standings?tab=constructors" },
  { term: "Alpine", url: "/standings?tab=constructors" },
  { term: "Williams", url: "/standings?tab=constructors" },
  { term: "Haas", url: "/standings?tab=constructors" },
  { term: "Sauber", url: "/standings?tab=constructors" },
];

const SORTED_TERMS = [...F1_TERMS].sort((a, b) => b.term.length - a.term.length);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function injectInternalLinks(text: string, usedTerms: Set<string>): ContentPart[] {
  let parts: ContentPart[] = [text];

  for (const { term, url } of SORTED_TERMS) {
    if (usedTerms.has(term.toLowerCase())) continue;

    const newParts: ContentPart[] = [];
    let matched = false;

    for (const part of parts) {
      if (typeof part !== "string") {
        newParts.push(part);
        continue;
      }

      const regex = new RegExp(`(${escapeRegex(term)})`, "i");
      const match = regex.exec(part);

      if (match && !matched) {
        matched = true;
        const before = part.slice(0, match.index);
        const after = part.slice(match.index + match[0].length);
        if (before) newParts.push(before);
        newParts.push({ term: match[0], url, key: `${term}-${match.index}` });
        if (after) newParts.push(after);
      } else {
        newParts.push(part);
      }
    }

    if (matched) {
      usedTerms.add(term.toLowerCase());
      parts = newParts;
    }
  }

  return parts;
}

export function countLinkableTerms(content: string): number {
  let count = 0;
  const used = new Set<string>();
  for (const { term } of SORTED_TERMS) {
    if (used.has(term.toLowerCase())) continue;
    const regex = new RegExp(`(${escapeRegex(term)})`, "i");
    if (regex.test(content)) {
      used.add(term.toLowerCase());
      count++;
    }
  }
  return count;
}
