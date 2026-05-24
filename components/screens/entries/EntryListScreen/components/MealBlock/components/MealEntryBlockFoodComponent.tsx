import {FC, useState} from 'react';
import {View} from 'react-native';
import {cn} from '../../../../../../../cn';
import {FoodComponent} from '../../../../../../../openapi-client';
import {avoidLet} from '../../../../../../../utils/avoidLet';
import {FoodUtility} from '../../../../../../../utils/FoodUtility/FoodUtility';
import {ThemedImage} from '../../../../../../blocks/ThemedImage/ThemedImage';
import {ThemedText} from '../../../../../../blocks/ThemedText/ThemedText';
import {FoodMacros} from '../../../../../food/FoodListScreen/utils/getFoodValueRecursively';

const floorToMax3Decimals = (value: number): number => {
  return Math.floor(value * 1000) / 1000;
};

const useImagePlaceHolder = (square?: boolean): string => {
  const noImageLabel = 'No Image'.replaceAll(' ', '+');
  const size = square ? '600x600' : '600x400';
  return `https://dummyimage.com/${size}/000/fff&text=${noImageLabel}`;
};

export const MealEntryBlockFoodComponent: FC< {item: FoodComponent, own?: boolean}> = (props) => {
  const foodUtility = new FoodUtility();
  const item = props.item;
  const food = props.item.food;
  const defaultAmount = props.item.food.servingSize ?? 100;
  const initialAmount = props.item.amount ?? defaultAmount;
  const servingSize = food.servingSize ?? 100;
  const initialServings = food.isMeal ? props.item.amount : (initialAmount / servingSize);
  const placeholder = useImagePlaceHolder();
  const [amount] = useState(initialAmount.toFixed(0));
  const [servings] = useState(floorToMax3Decimals(initialServings).toString());
  const multiplier = avoidLet(() => {
    if (!isNaN(parseFloat(servings))) {
      return parseFloat(servings);
    }
    if (props.item.food.servingSize === null) {
      if (!isNaN(parseFloat(amount))) {
        return parseFloat(amount) / 100;
      }
      return defaultAmount / 100;
    }
    return 1;
  });

  const protein = foodUtility.getFoodMacro(food, FoodMacros.Protein) * multiplier;
  const carbs = foodUtility.getFoodMacro(food, FoodMacros.Carbs) * multiplier;
  const fat = foodUtility.getFoodMacro(food, FoodMacros.Fat) * multiplier;
  const calories = foodUtility.getFoodCalories(food) * multiplier;

  const servedInServings = item.food.isMeal || item.food.servingSize !== null;

  return (
    <View
    key={item.food.id}
    className="flex h-auto flex-row items-start justify-stretch p-2 rounded-md gap-s bg-cavity/50 relative"
  >
    <View className="w-20 h-20 self-stretch">
      <ThemedImage source={{uri: item.food.image?.url ?? placeholder}} className="w-full h-full object-cover rounded-md" />
    </View>
    <View className="flex flex-row gap-5 items-start">
      <View className="flex flex-col gap-2">
        <View className="flex flex-row gap-5 items-center">
        <ThemedText className="grow font-bold">
            {!props.own && item.food.name}
        </ThemedText>
        </View>
        <View className="w-full flex flex-row gap-1 items-center">
          <View className="overflow-hidden">
            <ThemedText>Calories</ThemedText>
            <ThemedText className="h-10 flex items-center">{calories.toFixed(0)}</ThemedText>
          </View>
          <View className="overflow-hidden">
            <ThemedText>Protein</ThemedText>
            <ThemedText className="h-10 flex items-center">{protein.toFixed(1)}</ThemedText>
          </View>
          <View className="overflow-hidden">
            <ThemedText>Fat</ThemedText>
            <ThemedText className="h-10 flex items-center">{fat.toFixed(1)}</ThemedText>
          </View>
          <View className="overflow-hidden">
            <ThemedText>Carbs</ThemedText>
            <ThemedText className="h-10 flex items-center">{carbs.toFixed(1)}</ThemedText>
          </View>
            <View className={cn(item.food.isMeal ? 'hidden' : '', 'w-16 overflow-hidden')}>
                <ThemedText>Grams</ThemedText>
                <ThemedText className="h-10 flex items-center">{amount}</ThemedText>
            </View>
          <View className={cn(!servedInServings ? 'hidden' : '', 'w-16 overflow-hidden')}>
            <ThemedText className="w-20 overflow-hidden">Servings</ThemedText>
            <View className="w-16">
              <ThemedText className="h-10 flex items-center">{servings}</ThemedText>
            </View>
          </View>
        </View>
        {/* <View className={cn(item.food.servingSize === null ? 'invisible' : '', 'flex-row gap-3 items-center')}>
          <ThemedText>Serving Size</ThemedText>
          <ThemedText>{item.food.servingSize?.toFixed(0)} {item.food.servingSizeUnit}</ThemedText>
        </View> */}
      </View>
    </View>
  </View>
  );
};
