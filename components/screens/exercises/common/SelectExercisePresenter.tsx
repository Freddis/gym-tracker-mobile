import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {SegmentedControlItem, ThemedSegmentedControl} from '../../../blocks/ThemedSegmentedControl/ThemedSegmentedControl';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {ThemedSearchInput} from '../../../blocks/ThemedSearchInput/ThemedSearchInput';
import {useQuery} from '@tanstack/react-query';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {NestedAppExercise} from '../../../../utils/ExerciseService/types/NestedAppExercise';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {safeListRefresh} from '../../../../utils/safeListRefresh';
import {atom, PrimitiveAtom, useAtomValue, useSetAtom} from 'jotai';
import {splitAtom} from 'jotai/utils';
import {ExerciseAtomBlock} from './components/ExerciseAtomBlock';
import {queryClient} from '../../../../routes/_layout';

interface SelectExercisePresenterProps {
  onPress?: (item: NestedAppExercise, itemAtom: PrimitiveAtom<NestedAppExercise>) => void
}

export const SelectExercisePresenter: FC<SelectExercisePresenterProps> = (props) => {
  const [searchName, setSearchName] = useState<string|null>(null);
  const [library, setLibrary] = useState<'personal' | 'built-in'>('personal');
  const [refreshing, setRefreshing] = useState(false);
  // the picker can be mounted on top of the library, each of them needs a list of its own
  const [exerciseListAtom] = useState(() => atom<NestedAppExercise[]>([]));
  const exerciseSplitAtom = useMemo(() => splitAtom(exerciseListAtom, (x) => x.id), [exerciseListAtom]);
  const setExerciseList = useSetAtom(exerciseListAtom);
  const exerciseAtoms = useAtomValue(exerciseSplitAtom);
  const {exerciseService} = useServices();
  const {user} = useAuth();

  const response = useQuery({
    queryFn: () => exerciseService.getPersonalLibrary({
      presonal: library === 'personal',
      search: searchName ?? undefined,
    }),
    queryKey: ['exercises', library, searchName],
    placeholderData: undefined,
  });

  useEffect(() => {
    setExerciseList(response.data ?? []);
  }, [response.data, setExerciseList]);

  const segments: SegmentedControlItem[] = [
    {label: 'Personal Library', value: 'personal'},
    {label: 'Built-In Library', value: 'built-in'},
  ];
  const onLibraryChange = (item: SegmentedControlItem) => {
    setLibrary(item.value === 'personal' ? 'personal' : 'built-in');
  };
  const onRefresh = useCallback(async () => {
    if (!user) {
      return;
    }
    await safeListRefresh(setRefreshing, 'Failed to refresh exercises', async () => {
      if (!await exerciseService.pullFromServer(user.id)) {
        throw new Error('Failed to pull exercises');
      }
      if (!await exerciseService.pushToServer(user.id)) {
        throw new Error('Failed to push exercises');
      }
      await queryClient.invalidateQueries({queryKey: ['exercises']});
    });
  }, [exerciseService, user]);

  return (
    <FlatList
      className="h-full"
      initialNumToRender={30}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      keyExtractor={(x) => x.toString()}
      data={exerciseAtoms}
      renderItem={(ctx) => <ExerciseAtomBlock exerciseAtom={ctx.item} onPress={props.onPress} />}
      contentContainerClassName="p-m gap-m min-h-full"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <ThemedSearchInput
            onSearch={setSearchName}
            className="bg-surface"
            placeholder="Search"
          />
          <View className="flex-row items-center mt-s">
            <View className="flex-row grow">
              <ThemedSegmentedControl values={segments} onChange={onLibraryChange}/>
            </View>
            <ThemedLink href="/app/exercises/addExercise" iconName="plus" accented>Add</ThemedLink>
          </View>
          {response.isLoading && <LoadingBlock/>}
        </>
      }
    />
  );
};
