import {FC, useState} from 'react';
import {View, Pressable, Switch, Button} from 'react-native';
import {MealType} from '../../../../../../../openapi-client';
import {AppModal} from '../../../../../../blocks/AppModal/AppModal';
import {ThemedText} from '../../../../../../blocks/ThemedText/ThemedText';
import {useAppTheme} from '../../../../../../../hooks/useAppTheme';
import {FavoriteMealFilterModalProps} from './types/FavoriteMealFilterModalProps';

export const FavoriteMealFilterModal: FC<FavoriteMealFilterModalProps> = (props) => {
  const [types, setTypes] = useState<MealType[] | null>(null);
  const theme = useAppTheme();
  const onTypeChange = (type: MealType, value: boolean) => {
    const existingTypes = types ?? [];
    const newTypes = value ? [...existingTypes, type] : existingTypes.filter((t) => t !== type);
    const final = newTypes.length > 0 ? newTypes : null;
    setTypes(final);
    props.onChange({
      types: final,
    });
  };
  const onClear = () => {
    setTypes(null);
    props.onChange({
      types: null,
    });
  };
  return (
    <AppModal visible={props.visible} onClose={props.onClose}>
      <View style={{flexDirection: 'column', gap: theme.marginM}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginM}}>
          <ThemedText style={{flexGrow: 1}}>By Type</ThemedText>
          <Button title="Clear" color={theme.accent} onPress={onClear} />
        </View>
        {Object.values(MealType).map((type) => (
          <View key={type} style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginS}}>
            <Pressable
              onPress={() => onTypeChange(type, !(types ?? []).includes(type))}
              style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginS}}
            >
              <Switch
                value={(types ?? []).includes(type)}
                style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}], marginLeft: -10}}
                trackColor={{true: theme.accent}}
              />
              <ThemedText>{type}</ThemedText>
            </Pressable>
          </View>
        ))}
      </View>
    </AppModal>
  );
};
