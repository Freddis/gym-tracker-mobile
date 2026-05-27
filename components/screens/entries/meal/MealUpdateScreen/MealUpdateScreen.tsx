import {FC} from 'react';
import {ScreenContainer} from '../../../../blocks/ScreenContainer/ScreenContainer';
import {Stack, useRouter} from 'expo-router';
import {useAtom} from 'jotai';
import {mealAtom} from './mealAtom';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {MealAppEntry} from '../../../../../types/models/AppEntry';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {MealUpdateForm} from '../MealUpdateForm/MealUpdateForm';

export const MealUpdateScreen: FC = () => {
  const [entryAtom] = useAtom(mealAtom);
  const [entry, setEntry] = useAtom(entryAtom);
  const {entryAtomService, entryService} = useServices();
  const router = useRouter();
  const onChange = async (entry: MealAppEntry, image?: string | null) => {
    const result = await entryService.saveEntry(entry, image);
    setEntry(result);
  };
  const onDelete = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };
  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Meal', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <MealUpdateForm entry={entry} onChange={onChange} onDelete={onDelete} />
    </ScreenContainer>
  );
};
