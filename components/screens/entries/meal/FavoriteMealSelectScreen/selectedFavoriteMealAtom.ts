import {atom} from 'jotai';
import {MealAppEntry} from '../../../../../types/models/AppEntry';

export const selectedFavoriteMealAtom = atom<MealAppEntry | null>(null);
