import {PrimitiveAtom, Atom, atom} from 'jotai';
import {splitAtom} from 'jotai/utils';
import {Store} from 'jotai/vanilla/store';
import {AppEntry} from '../../types/models/AppEntry';
import {Logger} from '../Logger/Logger';
export class EntryListService {
  private entryListAtom: PrimitiveAtom<AppEntry[]>;
  private entryListSplit: Atom<PrimitiveAtom<AppEntry>[]>;
  private lastAddedEntryAtom: PrimitiveAtom<PrimitiveAtom<AppEntry>| null>;
  private store: Store;
  private logger: Logger;

  constructor(store: Store) {
    this.entryListAtom = atom<AppEntry[]>([]);
    this.entryListSplit = splitAtom(this.entryListAtom, (x) => x.id);
    this.lastAddedEntryAtom = atom<PrimitiveAtom<AppEntry>| null>(null);
    this.store = store;
    this.logger = new Logger(EntryListService.name);
    this.logger.info('EntryListService initialized');
  }

  setEntries(entries: AppEntry[]) {
    this.logger.info(`Setting new entries (${entries.length})`);
    this.store.set(this.entryListAtom, entries);
  }

  getEntryAtoms(): Atom<PrimitiveAtom<AppEntry>[]> {
    return this.entryListSplit;
  }
  getLastAddedEntryAtom(): PrimitiveAtom<PrimitiveAtom<AppEntry>| null> {
    return this.lastAddedEntryAtom;
  }

  addEntry(entry: AppEntry): PrimitiveAtom<AppEntry> {
    this.logger.info(`Adding entry ${entry.id}`);
    const entries = this.store.get(this.entryListAtom);
    this.store.set(this.entryListAtom, this.reorderEntries([entry, ...entries]));
    const split = this.store.get(this.entryListSplit);
    this.logger.info(`Split: ${split.length}`);
    const result = split.find((s) => this.store.get(s).id === entry.id);
    if (!result) {
      throw new Error('Entry not found');
    }
    this.store.set(this.lastAddedEntryAtom, result ?? null);
    return result;
  }

  updateAndReorder(entry: AppEntry): void {
    this.logger.info(`Updating and reordering entry ${entry.id}`);
    const entries = this.store.get(this.entryListAtom);
    const current = entries.find((e) => e.id === entry.id);
    this.logger.info(`Split: ${entries.length}`);
    if (current) {
      const newlist = entries.map((e) => e.id === entry.id ? entry : e);
      this.store.set(this.entryListAtom, this.reorderEntries(newlist));
    } else {
      this.logger.info(`Entry ${entry.id} not found. Skipping reordering`);
    }
  }

  update(entry: AppEntry) {
    this.logger.info(`Updating entry ${entry.id}`);
    const entries = this.store.get(this.entryListAtom);
    const current = entries.find((e) => e.id === entry.id);
    if (current) {
      const newlist = entries.map((e) => e.id === entry.id ? entry : e);
      this.store.set(this.entryListAtom, newlist);
    }
  }

  deleteEntry(entry: AppEntry) {
    this.logger.info(`Deleting entry ${entry.id}`);
    const entries = this.store.get(this.entryListAtom);
    const newlist = entries.filter((e) => e.id !== entry.id);
    this.store.set(this.entryListAtom, newlist);
  }

  protected reorderEntries(entries: AppEntry[]) {
    const newlist = [...entries].sort((a, b) => b.time.getTime() - a.time.getTime());
    return newlist;
  }
}
