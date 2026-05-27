import {FC, useState} from 'react';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {FlatList, View} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {ThemedSearchInput} from '../../../blocks/ThemedSearchInput/ThemedSearchInput';
import {SegmentedControlItem, ThemedSegmentedControl} from '../../../blocks/ThemedSegmentedControl/ThemedSegmentedControl';
import {useQuery} from '@tanstack/react-query';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {useSetAtom} from 'jotai';
import {selectedFoodAtom} from './selectedFoodAtom';
import {FoodListItem} from './components/FoodListItem';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';

export const FoodSelectScreen: FC = () => {
  const [searchName, setSearchName] = useState<string|null>(null);
  const setSelectedFoodAtom = useSetAtom(selectedFoodAtom);
  const [library, setLibrary] = useState<'personal' | 'built-in'>('personal');
  const {foodService} = useServices();
  const router = useRouter();
  const response = useQuery({
    queryFn: () => foodService.getFood({
      search: searchName ?? undefined,
      personalLibrary: library === 'personal',
    }),
    queryKey: ['food', library, searchName],
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

  const onPress = (item: AppFood) => {
    setSelectedFoodAtom(item);
    router.back();
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Food Select', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <View className="h-full">
        <View className="p-m">
          <ThemedSearchInput
            autoFocus
            returnKeyType="done"
            onSearch={setSearchName}
            className="bg-surface"
            placeholder="Search"
            debounce={1000}
          />
          <View className="flex-row items-center mt-s">
            <View className="flex-row grow">
              <ThemedSegmentedControl values={segments} onChange={onLibraryChange}/>
            </View>
            {/* <ThemedLink href="/app/exercises/addExercise" iconName="plus">Add</ThemedLink> */}
          </View>
        </View>
        <View className="flex-1 bg-surface">
          {response.isFetching && <LoadingBlock/>}
          {!response.isFetching && response.data && (
            <FlatList
            removeClippedSubviews={true}
            keyExtractor={(x) => x.id}
            data={items}
            renderItem={(ctx) => <FoodListItem food={ctx.item} onPress={onPress} />}
            contentContainerClassName="p-m gap-m"
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};
