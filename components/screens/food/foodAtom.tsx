import {atom, PrimitiveAtom} from 'jotai';
import {EntryVisibility, ServingSizeUnit} from '../../../openapi-client';
import uuid from 'react-native-uuid';
import {AppFood} from '../../../utils/FoodService/types/AppFood';

const initialFood: AppFood = {
  id: uuid.v4(),
  name: '',
  description: '',
  image: null,
  protein: 0,
  carbs: 0,
  fat: 0,
  calories: 0,
  servingSize: null,
  servingSizeUnit: ServingSizeUnit.GRAM,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  isMeal: false,
  components: [],
  lastPushedAt: null,
  lastPulledAt: null,
  copiedFromId: null,
  visibility: EntryVisibility.PUBLIC,
  barcode: null,
};
export const foodAtom = atom<PrimitiveAtom<AppFood>>(atom(initialFood));
