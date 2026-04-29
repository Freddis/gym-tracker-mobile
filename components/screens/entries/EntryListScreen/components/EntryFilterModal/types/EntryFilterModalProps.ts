import {EntryType} from '../../../../../../../openapi-client';
import {AppModalProps} from '../../../../../../blocks/AppModal/types/AppModalProps';

export interface EntryFilterModalProps extends Omit<AppModalProps, 'children'> {
  onChange: (e: {types: EntryType[]| null, date: Date | null}) => void;
}
