import {MealType} from '../../../../../../../../openapi-client';
import {AppModalProps} from '../../../../../../../blocks/AppModal/types/AppModalProps';

export interface FavoriteMealFilterModalProps extends Omit<AppModalProps, 'children'> {
  onChange: (e: {types: MealType[] | null}) => void;
}
