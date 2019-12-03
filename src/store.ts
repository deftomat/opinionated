import Configstore from 'configstore';
import { Context } from './context';

const incompleteChecksTTL = 60 * 60 * 1000;
const incompleteChecksKey = 'incompleteChecks';

const store = new Configstore('@deftomat/opinionated', { [incompleteChecksKey]: [] });

export function updateIncompleteChecks({ projectRoot }: Context, checks: Iterable<string>) {
  const now = Date.now();
  const entries: IncompleteChecksEntry[] = store.get(incompleteChecksKey);

  const index = entries.findIndex(entryFor(projectRoot, now));

  const entry: IncompleteChecksEntry = { key: projectRoot, at: now, checks: Array.from(checks) };
  if (index === -1) {
    entries.push(entry);
  } else {
    entries[index] = entry;
  }

  const valid = entries.filter(({ at }) => now <= at + incompleteChecksTTL);
  store.set(incompleteChecksKey, valid);
}

export function getIncompleteChecks({ projectRoot }: Context): Set<string> {
  const now = Date.now();
  const incomplete = store.get(incompleteChecksKey);

  const entry: IncompleteChecksEntry | undefined = incomplete.find(entryFor(projectRoot, now));

  if (entry) return new Set(entry.checks);
  return new Set();
}

interface IncompleteChecksEntry {
  readonly key: string;
  readonly at: number;
  readonly checks: string[];
}

function entryFor(projectRoot: string, now: number) {
  return ({ key, at }) => key === projectRoot && now <= at + incompleteChecksTTL;
}
