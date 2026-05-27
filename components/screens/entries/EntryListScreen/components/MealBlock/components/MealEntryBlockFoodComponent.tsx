import {FC} from 'react';
import {View} from 'react-native';
import {cn} from '../../../../../../../cn';
import {avoidLet} from '../../../../../../../utils/avoidLet';
import {FoodUtility} from '../../../../../../../utils/FoodUtility/FoodUtility';
import {ThemedImage} from '../../../../../../blocks/ThemedImage/ThemedImage';
import {ThemedText} from '../../../../../../blocks/ThemedText/ThemedText';
import {floorToMax3Decimals} from '../../../../../../../utils/floorToMax3Decimals';
import {useImagePlaceHolder} from '../../../../../../../utils/useImagePlaceHolder';
import {FoodMacros} from '../../../../../../../utils/FoodUtility/types/FoodMacros';
import {useRouter} from 'expo-router';
import {ThemedLink} from '../../../../../../blocks/ThemedLink/ThemedLink';
import {atom, useSetAtom} from 'jotai';
import {foodAtom} from '../../../../../food/foodAtom';
import {AppFoodComponent} from '../../../../../../../utils/FoodService/types/AppFoodComponent';

export const MealEntryBlockFoodComponent: FC< {item: AppFoodComponent, own?: boolean}> = (props) => {
  const setFoodAtom = useSetAtom(foodAtom);
  const router = useRouter();
  const foodUtility = new FoodUtility();
  const item = props.item;
  const food = props.item.food;
  const defaultAmount = props.item.food.servingSize ?? 100;
  const initialAmount = props.item.amount ?? defaultAmount;
  const servingSize = food.servingSize ?? 100;
  const initialServings = food.isMeal ? props.item.amount : (initialAmount / servingSize);
  const placeholder = useImagePlaceHolder();
  const amount = initialAmount.toFixed(0);
  const servings = floorToMax3Decimals(initialServings).toString();
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
  const onPress = () => {
    setFoodAtom(atom(item.food));
    router.navigate({
      pathname: '/app/entries/food/foodUpdate',
    });
  };
  return (
    <View
    key={item.food.id}
    className="flex h-auto flex-row items-start justify-stretch p-2 rounded-md gap-s bg-cavity/50 relative"
  >
    <View className="w-23 h-23 self-stretch">
      <ThemedImage source={{uri: item.food.image?.url ?? placeholder}} className="w-full h-full object-cover rounded-md" />
    </View>
    <View className="basis-0 grow gap-xs items-start justify-between">
      <View className="flex flex-row gap-5 items-center">
        <ThemedLink onPress={onPress} className="grow font-bold">{item.food.name}</ThemedLink>
      </View>
      <View className="w-full flex flex-row items-center justify-between">
        <View className="overflow-hidden">
          <ThemedText>Calories</ThemedText>
          <ThemedText>{calories.toFixed(0)}</ThemedText>
        </View>
        <View className="overflow-hidden">
          <ThemedText>Protein</ThemedText>
          <ThemedText>{protein.toFixed(1)}</ThemedText>
        </View>
        <View className="overflow-hidden">
          <ThemedText>Fat</ThemedText>
          <ThemedText>{fat.toFixed(1)}</ThemedText>
        </View>
        <View className="overflow-hidden">
          <ThemedText>Carbs</ThemedText>
          <ThemedText>{carbs.toFixed(1)}</ThemedText>
        </View>
        <View className={cn(item.food.isMeal ? 'hidden' : '')}>
            <ThemedText>Grams</ThemedText>
            <ThemedText>{amount}</ThemedText>
        </View>
      </View>
      <View className={cn(item.food.servingSize === null && !item.food.isMeal ? 'invisible' : '', 'flex-row gap-0 items-center')}>
        {!item.food.isMeal && (
          <>
            <ThemedText>Serving Size: {item.food.servingSize?.toFixed(0)} {item.food.servingSizeUnit}</ThemedText>
            <ThemedText>, Servings: {servings}</ThemedText>
          </>
        )}
        {item.food.isMeal && (
          <ThemedText>Servings: {servings}</ThemedText>
        )}
      </View>
    </View>
  </View>
  );
};
