import {StyleSheet, SectionList, View, FlatList} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {FC, useState} from 'react';
import {Link, Stack} from 'expo-router';
import {useDrizzle} from '@/utils/drizzle';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {ExerciseBlock} from '@/components/blocks/ExerciseBlock/ExerciseBlock';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useExerciseService} from '@/utils/ExerciseService/useExerciseService';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';

export const ExerciseListScreen: FC = () => {
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const [searchName, setSearchName] = useState<string>('');
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
  const items = exerciseService.createSectionListData(exercises.builtIn);

  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
          <View style={{padding: 10}}>
            <ThemedText>Search:</ThemedText>
            <ThemedTextInput onChangeText={setSearchName} value={searchName} />
          </View>
          <View style={{paddingBottom: 80, flex: 1}}>
          <SectionList
          ListHeaderComponent={
            <View>
            <View style={{padding: 10, paddingTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <ThemedText style={{}}>Personal Library</ThemedText>
              <Link href={'./addExercise'} style={{marginLeft: 10}} >
                  <ThemedText type="link" style={{color: '#2997ff'}}>Add Exercise</ThemedText>
              </Link>
            </View>
            <FlatList
              keyExtractor={(x) => x.id.toString()}
              data={exercises.personal}
              renderItem={(ctx) => <ExerciseBlock item={ctx.item} />}
              />
            <ThemedText style={{padding: 10, paddingTop: 20}}>Built-in Library</ThemedText>
            </View>
          }
            sections={items}
            keyExtractor={(item) => item.id.toString()}
            renderSectionHeader={ (ctx) => (
              <ThemedView style={{paddingLeft: 10}} type="backgroundSecondary">
                <ThemedText style={{fontWeight: 'bold'}}>{ctx.section.title.toUpperCase()}</ThemedText>
              </ThemedView>
            )}
            renderItem={(ctx) => <ExerciseBlock item={ctx.item}/>}>
          </SectionList>
          </View>
      </ThemedView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 70,
    flex: 1,
  },
});
