import {atom} from 'jotai';
import {Food} from '../../../../../openapi-client';

export const scannedFoodAtom = atom<Food | null>(null);
