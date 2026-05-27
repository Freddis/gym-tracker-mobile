import React, {FC} from 'react';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {Pressable, View} from 'react-native';
import {useRouter} from 'expo-router';
import {PrimitiveAtom, useAtom, useSetAtom} from 'jotai';
import {foodAtom} from '../../foodAtom';
import {AppFood} from '../../../../../utils/FoodService/types/AppFood';
import {FoodUtility} from '../../../../../utils/FoodUtility/FoodUtility';
import {FoodMacros} from '../../../../../utils/FoodUtility/types/FoodMacros';
import {useImagePlaceHolder} from '../../../../../utils/useImagePlaceHolder';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {SyncIcon} from '../../../entries/EntryListScreen/components/SyncIcon/SyncIcon';

export const FoodBlock: FC<{foodAtom: PrimitiveAtom<AppFood>}> = (props) => {
  const foodUtility = new FoodUtility();
  const placeholder = useImagePlaceHolder();
  const {imageService} = useServices();
  const setFoodAtom = useSetAtom(foodAtom);
  const [food] = useAtom(props.foodAtom);
  const servingSize = food.servingSize ?? 100;
  const totalProtein = foodUtility.getFoodMacro(food, FoodMacros.Protein);
  const totalCarbs = foodUtility.getFoodMacro(food, FoodMacros.Carbs);
  const totalFat = foodUtility.getFoodMacro(food, FoodMacros.Fat);
  const totalCalories = foodUtility.getFoodCalories(food);
  const router = useRouter();
  const onPress = () => {
    setFoodAtom(props.foodAtom);
    router.navigate({
      pathname: '/app/entries/food/foodUpdate',
    });
  };
  const imageUrl = imageService.getImageUrl(food.image);
  return (
  <Pressable onPress={onPress}>
    <ThemedBlock image={imageUrl ?? placeholder} imageHeight={150}>
        <View className="" >
          <View className="flex-row items-center">
            <ThemedText className="font-bold grow">
              <ThemedLink className="font-bold text-capitalize">{food.name}</ThemedLink>
            </ThemedText>
            <SyncIcon object={food} />
          </View>
          {food.description && <ThemedText>{food.description}</ThemedText>}
          <View className="flex-row gap-s">
            <ThemedText>Calories: {totalCalories.toFixed(0)}</ThemedText>
            <ThemedText>Protein: {totalProtein.toFixed(1)}</ThemedText>
            <ThemedText>Fat: {totalFat.toFixed(1)}</ThemedText>
            <ThemedText>Carbs: {totalCarbs.toFixed(1)}</ThemedText>
          </View>
          <View className="h-5">
            {food.servingSize && food.components.length <= 0 && (
              <View className="flex-row gap-s">
                <ThemedText>
                  Serving Size: {servingSize.toFixed(0)} {food.servingSizeUnit}
                </ThemedText>
              </View>
            )}
            {food.components.length > 0 && (
              <View className="flex flex-row items-start justify-start mt-2 overflow-hidden text-sm text-ellipsis">
                <ThemedText>{food.components.map((x) => x.food.name).join(', ')}</ThemedText>
              </View>
            )}
          </View>
        </View>
    </ThemedBlock>
   </Pressable>
  );
};
