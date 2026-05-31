import {AppEntry} from '../../types/models/AppEntry';
import {EntryService} from '../EntryService/EntryService';
import {EntryListService} from '../EntryListService/EntryListService';
import {queryClient} from '../../routes/_layout';
import {entryLens} from '../../components/screens/entries/EntryListScreen/components/EntryBlock/EntryBlock';
import {PrimitiveAtom} from 'jotai';

export class EntryAtomService {
  private entryService: EntryService;
  protected entryListService: EntryListService;

  constructor(entryService: EntryService, entryListService: EntryListService) {
    this.entryService = entryService;
    this.entryListService = entryListService;
  }

  getImageSource(entry: AppEntry): string | null {
    if (entry.image?.image) {
      return `data:image/jpeg;base64,${entry.image.image}`;
    }
    return entry.image?.url ?? null;
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

  addEntry<T extends AppEntry>(entry: T): PrimitiveAtom<T> {
    const atom = this.entryListService.addEntry(entry);
    const entryAtom = entryLens(entry, atom);
    return entryAtom;
  }

  async updateTime(entry: AppEntry, time: Date): Promise<void> {
    const newEntry: AppEntry = {
      ...entry,
      time: time,
    };
    await this.entryService.saveEntry(newEntry);
    this.entryListService.updateAndReorder(newEntry);
  }

  async deleteEntry(entry: AppEntry): Promise<void> {
    await this.entryService.deleteEntry(entry.id);
    this.entryListService.deleteEntry(entry);
  }

  reset() {
    queryClient.invalidateQueries({queryKey: ['entries']});
  }
}
