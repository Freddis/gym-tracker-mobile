import {StyleSheet, View, FlatList} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {FC, useState} from 'react';
import {Stack} from 'expo-router';
import {ExerciseBlock} from '@/components/blocks/ExerciseBlock/ExerciseBlock';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useExerciseService} from '@/utils/ExerciseService/useExerciseService';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {SegmentedControlItem, ThemedSegmentedControl} from '@/components/blocks/ThemedSegmentedControl/ThemedSegmentedControl';
import {useQuery} from '@tanstack/react-query';

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
  const [exerciseService] = useExerciseService();
  const search = searchName.trim().length >= 3 ? searchName.trim() : null;

  const response = useQuery({
    queryFn: () => exerciseService.getPersonalLibrary({
      presonal: library === 'personal',
      search: search || undefined,
    }),
    queryKey: ['exercises', library, search],
  });

  const items = response.data;
  // const items = exerciseService.createSectionListData(exercises.builtIn);
  const segments: SegmentedControlItem[] = [
    {label: 'Personal Library', value: 'personal'},
    {label: 'Built-In Library', value: 'built-in'},
  ];
  const onLibraryChange = (item: SegmentedControlItem) => {
    setLibrary(item.value === 'personal' ? 'personal' : 'built-in');
  };
  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
          <View style={{padding: theme.paddingM}}>
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
            {response.isLoading && <LoadingBlock/>}
            {response.data && <FlatList
            contentContainerStyle={{gap: theme.marginM}}
            keyExtractor={(x) => x.id.toString()}
            data={items}
            renderItem={(ctx) => <ExerciseBlock item={ctx.item} />}
            style={{paddingHorizontal: theme.paddingM, paddingBottom: 50}}
            />}
          </View>
      </ThemedView>
  );
};
