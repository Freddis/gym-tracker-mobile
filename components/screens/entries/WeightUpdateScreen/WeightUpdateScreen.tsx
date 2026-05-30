import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import React, {FC, useMemo, useState} from 'react';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {EntrySyncButton} from '../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {DateTimeUpdateModal} from '../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {useAtom} from 'jotai';
import {weightAtom} from './utils/weightAtom';
import {WeightAppEntry} from '../../../../types/models/AppEntry';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {dateToString} from '../../../../utils/dateToString';
import {WheelPickerItemProps} from 'react-native-ui-lib';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {AppModal} from '../../../blocks/AppModal/AppModel';
import {AppWheelPicker} from '../../../blocks/AppWheelPicker/AppWheelPicker';

export const WeightEditScreen: FC = () => {
  const [entryAtom] = useAtom(weightAtom);
  const [entry, setEntry] = useAtom(entryAtom);
  const {entryService} = useServices();
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const {entryAtomService} = useServices();
  const [weightValue, setWeight] = useState(entry.weight.weight);
  const [dateValue, setDate] = useState(entry.time);
  const router = useRouter();
  const kilograms = useMemo(() => {
    const kilograms: WheelPickerItemProps<string>[] = [];
    for (let i = 1; i <= 500; i++) {
      kilograms.push({label: i.toString(), value: i.toString()});
    }
    return kilograms;
  }, []);
  const grams = useMemo(() => {
    const grams: WheelPickerItemProps<string>[] = [];
    for (let i = 0; i <= 99; i++) {
      grams.push({label: i.toString(), value: i.toString()});
    }
    return grams;
  }, []);

  const weight = entry.weight;
  const initialKilos = weightValue.toString().split('.')[0];
  const initalGrams = Number(weightValue.toString().split('.')[1] ?? '0').toString(); //dealing with leading zeros
  const setKilos = (value: string) => {
    const newValue = value + '.' + initalGrams;
    setWeight(Number(newValue));
    updateWeight(Number(newValue));
  };
  const setGrams = (value: string) => {
    const newValue = initialKilos + '.' + value.padStart(2, '0');
    setWeight(Number(newValue));
    updateWeight(Number(newValue));
  };
  const updateDate = async (date: Date) => {
    setDate(date);
    await entryAtomService.updateTime(entry, date);
  };
  const updateWeight = async (weight: number) => {
    const updatedEntry: WeightAppEntry = {
      ...entry,
      weight: {
        ...entry.weight,
        weight: weight,
      },
    };
    const result = await entryService.saveEntry(updatedEntry);
    setEntry(result);
  };

  const weightString = (weight: number) => {
    const parts = weight.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    return `${integerPart}.${(decimalPart ?? '0').padEnd(2, '0')}`;
  };

  const deleteEntry = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView className="h-full p-m" nestedScrollEnabled={false}>
          <ThemedView>
            <Stack.Screen options={{title: 'Weight Entry', headerShown: true, headerLeft: () => <BackHeaderButton/>}} />
            <ThemedBlock>
              <View className="flex-row items-center">
                <ThemedText className="grow">Body Weight</ThemedText>
                <ThemedText onPress={() => setWeightModalVisible(true)}>{weightString(weightValue)} {weight.units}</ThemedText>
              </View>
              <Separator/>
              <View className="flex-row items-center">
                <ThemedText style={{flexGrow: 1}}>Date</ThemedText>
                <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
              </View>
              <Separator/>
              <View className="flex-row items-center">
                <ThemedText style={{flexGrow: 1}}>Synced</ThemedText>
                <EntrySyncButton entry={entry} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
              </View>
              <Separator />
                <View className="flex-row justify-center gap-40">
                  <ThemedLink accented onPress={deleteEntry}>Delete</ThemedLink>
                </View>
            </ThemedBlock>
          </ThemedView>
          <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
          <AppModal visible={weightModalVisible} onClose={() => setWeightModalVisible(false)}>
            <View className="w-full">
              <View className="pb-20 bg-surface w-full">
                <View className="px-m flex-row overflow-hidden justify-evenly gap-l">
                  <AppWheelPicker data={kilograms}
                    enableScrollByTapOnItem
                    onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
                    value={initialKilos ?? '50'}
                    onValueChanged={(item) => setKilos(item.item.value)}
                    itemTextClassName="text-on-main"
                    className="grow"
                    overlayItemClassName="bg-accent"
                   />
                  <AppWheelPicker
                    enableScrollByTapOnItem
                    className="grow"
                    itemTextClassName="text-on-main"
                    overlayItemClassName="bg-accent"
                    onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
                    data={grams}
                    value={initalGrams}
                    onValueChanged={(item) => setGrams(item.item.value)}
                   />
                </View>
              </View>
            </View>
          </AppModal>
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
