import {FC} from 'react';
import {Pressable} from 'react-native';
import {MealAppEntry} from '../../../../../../types/models/AppEntry';
import {MealEntryContent} from '../../../EntryListScreen/components/MealBlock/components/MealEntryContent';

export const FavoriteMealListItem: FC<{entry: MealAppEntry, onPress: (entry: MealAppEntry) => void}> = (props) => {
  return (
    <Pressable onPress={() => props.onPress(props.entry)}>
      <MealEntryContent entry={props.entry} />
    </Pressable>
  );
};
