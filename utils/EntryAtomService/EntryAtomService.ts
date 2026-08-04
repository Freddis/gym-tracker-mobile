import {AppEntry} from '../../types/models/AppEntry';
import {EntryService} from '../EntryService/EntryService';
import {EntryListService} from '../EntryListService/EntryListService';
import {queryClient} from '../../routes/_layout';
import {PrimitiveAtom} from 'jotai';
import {Store} from 'jotai/vanilla/store';
import {entryLens} from '../entryLens';
import {Logger} from '../Logger/Logger';

export class EntryAtomService {
  protected entryService: EntryService;
  protected entryListService: EntryListService;
  protected store: Store;
  protected logger: Logger = new Logger(EntryAtomService.name);

  constructor(entryService: EntryService, entryListService: EntryListService, store: Store) {
    this.entryService = entryService;
    this.entryListService = entryListService;
    this.store = store;
  }

  getImageSource(entry: AppEntry): string | null {
    if (entry.image?.image) {
      return `data:image/jpeg;base64,${entry.image.image}`;
    }
    return entry.image?.url ?? null;
  }

  async updateEntryAtom<T extends AppEntry>(entryAtom: PrimitiveAtom<T>, result: T, image?: string | null) {
    const updated = await this.entryService.saveEntry(result, image);
    this.store.set(entryAtom, updated);
    this.entryListService.updateAndReorder(result);
  }

  async updateImage(entry: AppEntry, image: string | null): Promise<void> {
    const newEntry = await this.entryService.saveEntry(entry, image);
    this.entryListService.update(newEntry);
  }

  async updateNote(entry: AppEntry, note: string): Promise<void> {
    const updatedEntry: AppEntry = {
      ...entry,
      note: note.trim() === '' ? null : note.trim(),
    };
    const newEntry = await this.entryService.saveEntry(updatedEntry);
    this.entryListService.update(newEntry);
  }

  async update(entry: AppEntry): Promise<AppEntry> {
    const newEntry = await this.entryService.saveEntry(entry);
    this.entryListService.update(newEntry);
    return newEntry;
  }

  addEntry<T extends AppEntry>(entry: T): PrimitiveAtom<T> {
    const atom = this.entryListService.addEntry(entry);
    const lens = entryLens(entry, atom);
    return lens;
  }

  async updateTime<T extends AppEntry>(entry: T, time: Date): Promise<T> {
    const newEntry: T = {
      ...entry,
      time: time,
    };
    const updatedEntry = await this.entryService.saveEntry(newEntry);
    this.entryListService.updateAndReorder(updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(entry: AppEntry): Promise<void> {
    await this.entryService.deleteEntry(entry.id);
    this.entryListService.deleteEntry(entry);
  }

  reset() {
    queryClient.invalidateQueries({queryKey: ['entries']});
  }
}
