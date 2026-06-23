import {PrimitiveAtom, getDefaultStore} from 'jotai';
import {AppEntry} from '../types/models/AppEntry';

/**
 * Creates an specific entry atom that updates the original entry atom when mutated.
 * @param value Any specific type of entry
 * @param entryAtom Entry atom
 * @returns
 */
export const entryLens = <T extends AppEntry>(
  value: T,
  entryAtom: PrimitiveAtom<AppEntry>
): PrimitiveAtom<T> => {
  // Gives the same effect, we're aiming here for type conversion for atom value
  const store = getDefaultStore();
  if (store.get(entryAtom) !== value) {
    throw new Error('Entry atom value does not match the value passed to the lens');
  }
  return entryAtom as any as PrimitiveAtom<T>;
  // console.log('entryLens', value.id);
  // const store = getDefaultStore();
  // const valueAtom = atom(value);
  // const unsubscribe = store.sub(entryAtom, () => {
  //   console.log('Lens caught atom change', value.id);
  //   const entry = store.get(entryAtom);
  //   const localValue = store.get(valueAtom);
  //   store.set(valueAtom, {
  //     ...localValue,
  //     ...entry,
  //   });
  // });
  // const lens = atom<T, [SetStateAction<T>], void>(
  //   (get): T => {
  //     return get(valueAtom);
  //   },
  //   (_, set, update) => {
  //     set(valueAtom, update);
  //     set(entryAtom, (prev) => ({
  //       ...prev,
  //       ...update,
  //     }));
  //   }
  // );

  // lens.onMount = () => {
  //   return () => {
  //     console.log('Lens unmounted, unsubscribing', value.id);
  //     unsubscribe();
  //   };
  // };
  // return lens;
};
