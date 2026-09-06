import {PrimitiveAtom, useAtom, useSetAtom} from 'jotai';
import {FC} from 'react';
import {MealAppEntry} from '../../../../../../types/models/AppEntry';
import {Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {mealAtom} from '../../../meal/MealUpdateScreen/mealAtom';
import {MealEntryContent} from './components/MealEntryContent';

export const MealBlock: FC<{entryAtom: PrimitiveAtom<MealAppEntry>}> = (props) => {
  const [entry] = useAtom(props.entryAtom);
  const setMealAtom = useSetAtom(mealAtom);
  const router = useRouter();
  const onPress = () => {
    setMealAtom(props.entryAtom);
    router.navigate({
      pathname: '/app/entries/meal/mealUpdate',
    });
  };
  return (
    <Pressable onPress={onPress}>
      <MealEntryContent entry={entry} />
    </Pressable>
  );
};
