import {EntryType} from '../../../openapi-client';
import {IEntryService} from '../../../types/IEntryService';
import {NumericEntryKeys} from './NumericEntryKeys';

export type EntryServiceMap = {
  [k in Exclude<EntryType, EntryType.POST>]: {
   key: NumericEntryKeys,
   service: IEntryService<k>
   }
 }
