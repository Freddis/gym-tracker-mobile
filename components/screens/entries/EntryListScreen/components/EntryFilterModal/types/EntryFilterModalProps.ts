import {EntryListFilter} from '@/utils/EntryListService/types/EntryListFilter';
import {AppModalProps} from '../../../../../../blocks/AppModal/types/AppModalProps';

export interface EntryFilterModalProps extends Omit<AppModalProps, 'children'> {
  filter: EntryListFilter;
  onChange: (filter: EntryListFilter) => void;
}
