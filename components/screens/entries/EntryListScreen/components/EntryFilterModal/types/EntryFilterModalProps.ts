import {EntryType} from '../../../../../../../openapi-client';
import {AppModalProps} from '../../../../../../blocks/AppModal/types/AppModalProps';

export interface EntryFilterModalProps extends Omit<AppModalProps, 'children'> {
  onChange: (types: EntryType[]) => void;
}
