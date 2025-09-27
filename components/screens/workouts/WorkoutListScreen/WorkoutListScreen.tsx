import {View, Pressable, ScrollView} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Link, Stack, useNavigation, useRouter} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {useDrizzle} from '@/utils/drizzle';
import {FC, useState} from 'react';
import {AppWorkout} from '@/types/models/AppWorkout';
import {WorkoutBlock} from './components/WorkoutBlock/WorkoutBlock';
import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ScreenContainer} from '@/components/blocks/ScrenContainer/ScreenContainer';
import {ThemedButtonList} from '@/components/blocks/ThemedButtonList/ThemedButtonList';

export const WorkoutListScreen: FC = () => {
  console.log('Workouts');
  const navigation = useNavigation();
  const theme = useAppTheme();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const router = useRouter();
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle();
  const sqlQuery = db.query.workouts.findMany({
    with: {
      exercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (t, op) => [
              op.asc(t.createdAt),
            ],
          },
        },
        orderBy: (t, op) => [
          op.asc(t.createdAt),
        ],
      },
    },
    where: (t, op) => op.and(
      op.isNull(t.deletedAt)
    ),
    orderBy: (t, op) => op.desc(t.start),
    limit: 30,
  });
  const query = useLiveQuery(sqlQuery, [focusedCounter]);
  if (!query.data) {
    return <LoadingBlock />;
  }
  const workouts = query.data;
  const openWorkout = (workout: AppWorkout) => {
    router.navigate({
      pathname: './editWorkout',
      params: {
        workoutId: workout.id,
      },
    });
  };
  return (
    <ScreenContainer style={{paddingHorizontal: 0}}>
      <Stack.Screen options={{title: 'Workout List', headerShown: false}} />
      <ScrollView style={{paddingHorizontal: theme.paddingM}}>
        <ThemedButtonList items={[['Workout Types', '/app/workouts/workoutTypeList']]} />
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
          <ThemedText style={{flexGrow: 1}}>Entries:</ThemedText>
          <Link href={'./editWorkout'} asChild>
            <Pressable style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
              <ThemedText style={{color: theme.accent}}>Add</ThemedText>
              <IconSymbol name={'plus'} color={theme.accent} size={20}/>
            </Pressable>
          </Link>
        </View>
        <View style={{flexDirection: 'column', gap: theme.marginM, marginTop: theme.marginS, marginBottom: 50}}>
          {workouts.map((entry) => (
            <WorkoutBlock key={entry.id} onPress={openWorkout} workout={entry}/>
          ))}
        </View>
     </ScrollView>
    </ScreenContainer>
  );
};

