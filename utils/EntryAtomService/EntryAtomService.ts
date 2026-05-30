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
