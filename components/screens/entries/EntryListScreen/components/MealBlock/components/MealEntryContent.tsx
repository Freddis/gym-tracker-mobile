import {FC} from 'react';
import {View} from 'react-native';
import {MealAppEntry} from '../../../../../../../types/models/AppEntry';
import {FoodUtility} from '../../../../../../../utils/FoodUtility/FoodUtility';
import {AppSeparator} from '../../../../../../blocks/AppSeparator/AppSeparator';
import {IconSymbol} from '../../../../../../blocks/IconSymbol/IconSymbol';
import {ThemedBlock} from '../../../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../../../blocks/ThemedText/ThemedText';
import {wrap} from '../../../../meal/MealUpdateScreen/wrap';
import {PostContent} from '../../PostContent/PostContent';
import {SyncIcon} from '../../SyncIcon/SyncIcon';
import {MealEntryBlockFoodComponent} from './MealEntryBlockFoodComponent';

const getTime = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const MealEntryContent: FC<{entry: MealAppEntry}> = (props) => {
  const entry = props.entry;
  const foodUtility = new FoodUtility();
  const date = entry.time;
  const nutritionFacts = foodUtility.getNutritionFacts(entry.meal.food);
  const totalProtein = nutritionFacts.protein;
  const totalCarbs = nutritionFacts.carbs;
  const totalFat = nutritionFacts.fat;
  const totalCalories = nutritionFacts.calories;
  const food = entry.meal.food.map(wrap);
  return (
    <ThemedBlock>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-s">
          <ThemedText className="font-bold text-lg">Meal</ThemedText>
          {entry.meal.favorite && (
            <IconSymbol name="star.fill" size={16} color="#f5c518" />
          )}
        </View>
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
          <SyncIcon object={entry} />
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
  );
};
