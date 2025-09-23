import {StyleSheet, View, FlatList} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {FC, useState} from 'react';
import {Stack} from 'expo-router';
import {useDrizzle} from '@/utils/drizzle';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {ExerciseBlock} from '@/components/blocks/ExerciseBlock/ExerciseBlock';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useExerciseService} from '@/utils/ExerciseService/useExerciseService';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {SegmentedControlItem, ThemedSegmentedControl} from '@/components/blocks/ThemedSegmentedControl/ThemedSegmentedControl';

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 70,
    paddingHorizontal: 0,
    flex: 1,
  },
});

export const ExerciseListScreen: FC = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const [searchName, setSearchName] = useState<string>('');
  const [library, setLibrary] = useState<'personal' | 'built-in'>('personal');
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle();
  const [exerciseService] = useExerciseService();
  const search = searchName.trim().length >= 3 ? searchName.trim() : null;
  const query = db.query.exercises.findMany({
    where: (t, op) => op.and(
      op.isNull(t.deletedAt)
    ),
  });
  const exerciseResponse = useLiveQuery(query, [focusedCounter]);
  if (exerciseResponse.error || exerciseResponse.data.length <= 0) {
    return <LoadingBlock >
      <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
    </LoadingBlock>;
  }

  const exercises = exerciseService.processExerciseList(exerciseResponse.data, {
    nameFilter: search ?? undefined,
  });
  // const items = exerciseService.createSectionListData(exercises.builtIn);
  const segments: SegmentedControlItem[] = [
    {label: 'Personal Library', value: 'personal'},
    {label: 'Built-In Library', value: 'built-in'},
  ];
  const onLibraryChange = (item: SegmentedControlItem) => {
    setLibrary(item.value === 'personal' ? 'personal' : 'built-in');
  };
  const items = library === 'personal' ? exercises.personal : exercises.builtIn;
  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
          <View style={{padding: 10}}>
            <ThemedTextInput
              onChangeText={setSearchName}
              style={{backgroundColor: theme.surface}}
              value={searchName}
              placeholder="Search"
            />
            <View style={{flexDirection: 'row', marginTop: 10, alignItems: 'center'}}>
              <View style={{flexDirection: 'row', flexGrow: 1}}>
                <ThemedSegmentedControl values={segments} onChange={onLibraryChange}/>
              </View>
              <ThemedLink href="/app/exercises/addExercise" iconName="plus">Add</ThemedLink>
            </View>
          </View>
          <View style={{paddingBottom: 80, flex: 1}}>
            <FlatList
            contentContainerStyle={{gap: 10}}
            keyExtractor={(x) => x.id.toString()}
            data={items}
            renderItem={(ctx) => <ExerciseBlock item={ctx.item} />}
            style={{paddingHorizontal: 10, paddingBottom: 50}}
            />
          </View>
      </ThemedView>
  );
};
