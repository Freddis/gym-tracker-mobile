import {atom} from 'jotai';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';

export const selectedFoodAtom = atom<AppFood | null>(null);
