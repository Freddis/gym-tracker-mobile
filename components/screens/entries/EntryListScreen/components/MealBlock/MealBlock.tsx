import {PrimitiveAtom, useAtom} from 'jotai';
import {FC} from 'react';
import {MealAppEntry} from '../../../../../../types/models/AppEntry';
import {Pressable, View} from 'react-native';
import {ThemedBlock} from '../../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';
import {MealEntryBlockFoodComponent} from './components/MealEntryBlockFoodComponent';
import {FoodUtility} from '../../../../../../utils/FoodUtility/FoodUtility';
import {AppSeparator} from '../../../../../blocks/AppSeparator/AppSeparator';

export const MealBlock: FC<{entryAtom: PrimitiveAtom<MealAppEntry>}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
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
  return (
    <Pressable onPress={() => {}}>
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
        {entry.title && (
          <ThemedText className="font-semibold">
            {entry.title}
          </ThemedText>
        )}
        {entry.note && <ThemedText>{entry.note}</ThemedText>}
        {entry.image && (
          <ThemedImage source={{uri: entry.image?.url ?? undefined}} className="w-full h-80 mt-s rounded-md"/>
        )}
      <View className="mt-s gap-s">
        {entry.meal.food.map((food) => (
          <MealEntryBlockFoodComponent key={food.food.id} item={food} own={false} />
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
