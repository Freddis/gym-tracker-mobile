import {FC} from 'react';
import {View, Pressable, Switch, Button, ScrollView} from 'react-native';
import {Muscle} from '@/openapi-client';
import {AppModal} from '../../../../../blocks/AppModal/AppModal';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {useAppTheme} from '../../../../../../hooks/useAppTheme';
import {ExerciseFilterModalProps} from './types/ExerciseFilterModalProps';

export const ExerciseFilterModal: FC<ExerciseFilterModalProps> = (props) => {
  const theme = useAppTheme();
  const muscles = props.muscles ?? [];
  const onMuscleChange = (muscle: Muscle, value: boolean) => {
    const next = value ? [...muscles, muscle] : muscles.filter((item) => item !== muscle);
    props.onChange(next.length > 0 ? next : undefined);
  };
  const onClear = () => {
    props.onChange(undefined);
  };
  return (
    <AppModal visible={props.visible} onClose={props.onClose}>
      <View className="gap-m" style={{maxHeight: 500}}>
        <View className="flex-row items-center gap-m">
          <ThemedText className="grow">By Muscle</ThemedText>
          <Button title="Clear" color={theme.accent} onPress={onClear} />
        </View>
        <ScrollView>
          {Object.values(Muscle).map((muscle) => (
            <View key={muscle} className="flex-row items-center gap-s">
              <Pressable
                onPress={() => onMuscleChange(muscle, !muscles.includes(muscle))}
                className="flex-row items-center gap-s"
              >
                <Switch
                  value={muscles.includes(muscle)}
                  style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}], marginLeft: -10}}
                  trackColor={{true: theme.accent}}
                />
                <ThemedText>{muscle}</ThemedText>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </AppModal>
  );
};
