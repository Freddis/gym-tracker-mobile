import {Muscle} from '@/openapi-client';
import {AppModalProps} from '../../../../../../blocks/AppModal/types/AppModalProps';

export interface ExerciseFilterModalProps extends Omit<AppModalProps, 'children'> {
  muscles?: Muscle[];
  onChange: (muscles: Muscle[] | undefined) => void;
}
