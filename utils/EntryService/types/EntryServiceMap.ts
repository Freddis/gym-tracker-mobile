import {EntryType} from '../../../openapi-client';
import {IEntryService} from '../../../types/IEntryService';
import {NumericEntryKeys} from './NumericEntryKeys';

export type EntryServiceMap = {
  [k in Exclude<EntryType, EntryType.POST | EntryType.MEAL | EntryType.CALORIE_GOAL>]: {
   key: NumericEntryKeys,
   service: IEntryService<k>
   }
 }
