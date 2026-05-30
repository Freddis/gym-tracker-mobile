import {PrimitiveAtom, Atom, atom} from 'jotai';
import {splitAtom} from 'jotai/utils';
import {Store} from 'jotai/vanilla/store';
import {AppEntry} from '../../types/models/AppEntry';

export class EntryListService {
  private entryListAtom: PrimitiveAtom<AppEntry[]>;
  private entryListSplit: Atom<PrimitiveAtom<AppEntry>[]>;
  private store: Store;

  constructor(store: Store) {
    this.entryListAtom = atom<AppEntry[]>([]);
    this.entryListSplit = splitAtom(this.entryListAtom, (x) => x.id);
    this.store = store;
  }

  setEntries(entries: AppEntry[]) {
    this.store.set(this.entryListAtom, entries);
  }

  getEntryAtoms(): Atom<PrimitiveAtom<AppEntry>[]> {
    return this.entryListSplit;
  }

  addEntry(entry: AppEntry): PrimitiveAtom<AppEntry> {
    const entries = this.store.get(this.entryListAtom);
    this.store.set(this.entryListAtom, [entry, ...entries]);
    const split = this.store.get(this.entryListSplit);
    const result = split[0];
    if (!result) {
      throw new Error('Entry not found');
    }
    return result;
  }

  updateAndReorder(entry: AppEntry): void {
    const entries = this.store.get(this.entryListAtom);
    const current = entries.find((e) => e.id === entry.id);
    if (current) {
      const newlist = entries.map((e) => e.id === entry.id ? entry : e);
      newlist.sort((a, b) => b.time.getTime() - a.time.getTime());
      this.store.set(this.entryListAtom, newlist);
    }
  }

  deleteEntry(entry: AppEntry) {
    const entries = this.store.get(this.entryListAtom);
    const newlist = entries.filter((e) => e.id !== entry.id);
    this.store.set(this.entryListAtom, newlist);
  }
}
