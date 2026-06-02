import {FC} from 'react';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {Stack, useRouter} from 'expo-router';
import {useAtom} from 'jotai';
import {mealAtom} from './mealAtom';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {MealAppEntry} from '../../../../../types/models/AppEntry';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {MealUpdateForm} from '../MealUpdateForm/MealUpdateForm';
import {useUser} from '../../../../providers/AuthProvider/useUser';

export const MealUpdateScreen: FC = () => {
  const [entryAtom, setEntryAtom] = useAtom(mealAtom);
  const [entry] = useAtom(entryAtom);
  const {entryAtomService, mealService} = useServices();
  const user = useUser();
  const router = useRouter();
  const onChange = async (entry: MealAppEntry, image?: string | null) => {
    // todo: need to split this and update of time, since we don't need to reorder the list everytime
    await entryAtomService.updateEntryAtom(entryAtom, entry, image);
  };
  const onDelete = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };
  const onCopy = async () => {
    const copy = await mealService.copy(entry, user);
    const newAtom = entryAtomService.addEntry(copy);
    setEntryAtom(newAtom);
  };
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Meal', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <MealUpdateForm key={entry.id} entry={entry} onChange={onChange} onDelete={onDelete} onCopy={onCopy} />
    </AppScreenContainer>
  );
};
