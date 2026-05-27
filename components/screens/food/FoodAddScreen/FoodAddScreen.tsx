import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {Stack} from 'expo-router';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {RoutePath} from '../../../../types/RoutePath';

export const FoodAddScreen = () => {
  const items: [string, RoutePath | (() => void)][] = [
    ['Add Food', '/app/entries/food/foodCreate'],
    ['Add A Dish', '/app/entries/food/dishCreate'],
  ];
  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Food Create', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ThemedScrollView className="h-full p-m">
          <ThemedButtonList items={items} replace={true} />
      </ThemedScrollView>
    </ScreenContainer>
  );
};
