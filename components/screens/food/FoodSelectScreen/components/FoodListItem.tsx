import {FC} from 'react';
import {Pressable, View} from 'react-native';
import {cn} from '../../../../../cn';
import {FoodUtility} from '../../../../../utils/FoodUtility/FoodUtility';
import {ThemedImage} from '../../../../blocks/ThemedImage/ThemedImage';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {useImagePlaceHolder} from '../../../../../utils/useImagePlaceHolder';
import {FoodMacros} from '../../../../../utils/FoodUtility/types/FoodMacros';
import {AppFood} from '../../../../../utils/FoodService/types/AppFood';


export const FoodListItem: FC<{food: AppFood, onPress: (item: AppFood) => void}> = (props) => {
  const foodUtility = new FoodUtility();
  const food = props.food;
  const placeholder = useImagePlaceHolder();
  const protein = foodUtility.getFoodMacro(props.food, FoodMacros.Protein);
  const carbs = foodUtility.getFoodMacro(props.food, FoodMacros.Carbs);
  const fat = foodUtility.getFoodMacro(props.food, FoodMacros.Fat);
  const calories = foodUtility.getFoodCalories(props.food);

  return (
    <Pressable onPress={() => props.onPress(props.food)}>
    <View
    key={food.id}
    className="flex h-auto flex-row items-start justify-stretch p-2 rounded-md gap-s bg-cavity/50 relative"
  >
    <View className="w-23 h-23 self-stretch">
      <ThemedImage source={{uri: food.image?.url ?? placeholder}} className="w-full h-full object-cover rounded-md" />
    </View>
    <View className="basis-0 grow gap-xs items-start justify-between">
      <View className="flex flex-row gap-5 items-center">
        <ThemedText className="grow font-bold">{food.name}</ThemedText>
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
      </View>
      <View className={cn(food.servingSize === null ? 'invisible' : '', 'flex-row gap-0 items-center')}>
        <ThemedText>Serving Size: {food.servingSize?.toFixed(0)} {food.servingSizeUnit}</ThemedText>
      </View>
    </View>
  </View>
  </Pressable>
  );
};
