import {EntryType} from '../../../openapi-client';

export interface EntryListFilter {
  types?: EntryType[];
  date?: Date;
  search?: string;
}
