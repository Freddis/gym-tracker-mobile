import {FlatList, View} from 'react-native';
import {ExerciseBlock} from '../../../blocks/ExerciseBlock/ExerciseBlock';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {SegmentedControlItem, ThemedSegmentedControl} from '../../../blocks/ThemedSegmentedControl/ThemedSegmentedControl';
import {FC, useMemo, useState} from 'react';
import {ThemedSearchInput} from '../../../blocks/ThemedSearchInput/ThemedSearchInput';
import {useQuery} from '@tanstack/react-query';
import {Exercise} from '../../../../openapi-client';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';

interface SelectExercisePresenterProps {
  onPress?: (item: Exercise) => void
}

export const SelectExercisePresenter: FC<SelectExercisePresenterProps> = (props) => {
  const [searchName, setSearchName] = useState<string|null>(null);
  const [library, setLibrary] = useState<'personal' | 'built-in'>('personal');
  const {exerciseService} = useServices();

  const response = useQuery({
    queryFn: () => exerciseService.getPersonalLibrary({
      presonal: library === 'personal',
      search: searchName ?? undefined,
    }),
    queryKey: ['exercises', library, searchName],
    placeholderData: undefined,
  });
  const items = response.data;
  const segments: SegmentedControlItem[] = [
    {label: 'Personal Library', value: 'personal'},
    {label: 'Built-In Library', value: 'built-in'},
  ];
  const onLibraryChange = (item: SegmentedControlItem) => {
    setLibrary(item.value === 'personal' ? 'personal' : 'built-in');
  };

  return (
    <View className="h-full">
      <View className="p-m">
        <ThemedSearchInput
          onSearch={setSearchName}
          className="bg-surface"
          placeholder="Search"
        />
        <View className="flex-row items-center mt-s">
          <View className="flex-row grow">
            <ThemedSegmentedControl values={segments} onChange={onLibraryChange}/>
          </View>
          <ThemedLink href="/app/exercises/addExercise" iconName="plus">Add</ThemedLink>
        </View>
      </View>
      {useMemo(() => (
        <View>
          {response.isFetching && <LoadingBlock/>}
          {!response.isFetching && response.data && (
            <FlatList
            initialNumToRender={30}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            keyExtractor={(x) => x.id}
            data={items}
            renderItem={(ctx) => <ExerciseBlock item={ctx.item} onPress={props.onPress} />}
            contentContainerClassName="px-m gap-m"
            />
          )}
      </View>
    ), [items, response.isFetching, response.data, props.onPress])}
    </View>
  );
};
