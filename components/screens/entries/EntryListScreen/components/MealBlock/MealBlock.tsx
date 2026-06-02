import {PrimitiveAtom, useAtom, useSetAtom} from 'jotai';
import {FC} from 'react';
import {MealAppEntry} from '../../../../../../types/models/AppEntry';
import {Pressable, View} from 'react-native';
import {ThemedBlock} from '../../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {MealEntryBlockFoodComponent} from './components/MealEntryBlockFoodComponent';
import {FoodUtility} from '../../../../../../utils/FoodUtility/FoodUtility';
import {AppSeparator} from '../../../../../blocks/AppSeparator/AppSeparator';
import {useRouter} from 'expo-router';
import {mealAtom} from '../../../meal/MealUpdateScreen/mealAtom';
import {wrap} from '../../../meal/MealUpdateScreen/wrap';
import {PostContent} from '../PostContent/PostContent';

export const MealBlock: FC<{entryAtom: PrimitiveAtom<MealAppEntry>}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const setMealAtom = useSetAtom(mealAtom);
  const router = useRouter();
  const foodUtility = new FoodUtility();
  const date = entry.time;
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const nutritionFacts = foodUtility.getNutritionFacts(entry.meal.food);
  const totalProtein = nutritionFacts.protein;
  const totalCarbs = nutritionFacts.carbs;
  const totalFat = nutritionFacts.fat;
  const totalCalories = nutritionFacts.calories;
  const onPress = () => {
    setMealAtom(props.entryAtom);
    router.navigate({
      pathname: '/app/entries/meal/mealUpdate',
    });
  };
  const food = entry.meal.food.map(wrap);
  return (
    <Pressable onPress={onPress}>
    <ThemedBlock>
      <View className="flex-row items-center justify-between">
        <ThemedText className="font-bold text-lg">Meal</ThemedText>
        <ThemedText>
          {date.toLocaleDateString()}
        </ThemedText>
      </View>
      <View className="flex-row justify-between">
        <View>
            <ThemedText>{entry.meal.type}</ThemedText>
        </View>
        <View className="items-end">
          <ThemedText>
          {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
          </ThemedText>
          <EntrySyncButton entry={entry} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} readonly/>
        </View>
      </View>
      <View>
        <PostContent entry={entry} />
        <View className="mt-s gap-s">
          {food.map((food) => (
            <MealEntryBlockFoodComponent key={food.key} item={food.item} own={false} />
          ))}
        <AppSeparator noMargin/>
          <View className="flex flex-row gap-s items-start">
            <ThemedText>Calories: {totalCalories.toFixed(0)}</ThemedText>
            <ThemedText>Protein: {totalProtein.toFixed(1)}</ThemedText>
            <ThemedText>Fat: {totalFat.toFixed(1)}</ThemedText>
            <ThemedText>Carbs: {totalCarbs.toFixed(1)}</ThemedText>
          </View>
        </View>
      </View>
    </ThemedBlock>
  </Pressable>
  );
};
