import React, {FC} from 'react';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {Food} from '../../../../../openapi-client';
import {FoodMacros, getFoodCalories, getFoodMacro} from '../utils/getFoodValueRecursively';
import {useImagePlaceHolder} from '../utils/useImagePlaceHolder';
import {useAppTheme} from '../../../../../hooks/useAppTheme';
import {View} from 'react-native';

export const FoodBlock: FC<{food: Food}> = (props) => {
  const placeholder = useImagePlaceHolder();
  const servingSize = props.food.servingSize ?? 100;
  const totalProtein = getFoodMacro(props.food, FoodMacros.Protein);
  const totalCarbs = getFoodMacro(props.food, FoodMacros.Carbs);
  const totalFat = getFoodMacro(props.food, FoodMacros.Fat);
  const totalCalories = getFoodCalories(props.food);
  const theme = useAppTheme();
  // const to = router.buildLocation({to: route(RouteId.FoodUpdate), params: {id: props.food.id}}).href;
  return (
   <ThemedBlock
      image={props.food.image?.url ?? placeholder}
      imageHeight={150}
    >
      <View style={{padding: theme.paddingS, flexDirection: 'column', flexGrow: 1}}>
        <ThemedText style={{fontWeight: 'bold'}}>
          <ThemedLink style={{fontWeight: 'bold', textTransform: 'capitalize'}}>{props.food.name}</ThemedLink>
        </ThemedText>
        {props.food.description && <ThemedText>{props.food.description}</ThemedText>}
        <View style={{flexDirection: 'row', gap: theme.marginS}}>
        <ThemedText>Calories: {totalCalories.toFixed(0)}</ThemedText>
          <ThemedText>Protein: {totalProtein.toFixed(1)}</ThemedText>
          <ThemedText>Fat: {totalFat.toFixed(1)}</ThemedText>
          <ThemedText>Carbs: {totalCarbs.toFixed(1)}</ThemedText>
        </View>
        <View style={{height: 20}}>
          {props.food.servingSize && props.food.components.length <= 0 && (
            <View style={{flexDirection: 'row', gap: theme.marginS}}>
              <ThemedText>
                Serving Size: {servingSize.toFixed(0)} {props.food.servingSizeUnit}
              </ThemedText>
            </View>
          )}
          {props.food.components.length > 0 && (
            <View className="flex flex-row items-start justify-start mt-2 overflow-hidden text-sm text-ellipsis">
                <ThemedText>{props.food.components.map((x) => x.food.name).join(', ')}</ThemedText>
            </View>
          )}
        </View>
      </View>
   </ThemedBlock>
  );
};
