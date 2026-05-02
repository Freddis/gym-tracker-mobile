import {StyleSheet, View, KeyboardAvoidingView, Platform, Modal} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import React, {FC, useEffect, useState} from 'react';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {useEntryService} from '../../../../utils/EntryService/useEntryService';
import {EntrySyncButton} from '../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {WheelPicker, WheelPickerItemProps} from 'react-native-ui-lib';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {DateTimeUpdateModal} from '../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {string} from 'zod';

const kilograms: WheelPickerItemProps<string>[] = [];
for (let i = 1; i <= 500; i++) {
  kilograms.push({label: i.toString(), value: i.toString()});
}
const grams: WheelPickerItemProps<string>[] = [];
for (let i = 0; i <= 99; i++) {
  grams.push({label: i.toString(), value: i.toString()});
}

export const WeightEditScreen: FC = () => {
  const theme = useAppTheme();
  const [entryService] = useEntryService();
  const styles = getStyles(theme);
  const auth = useAuth();
  const user = auth.user;
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  if (!user) {
    throw new Error('No user');
  }
  const [weightValue, setWeight] = useState(0.0);
  const [dateValue, setDate] = useState(new Date());
  const params = useLocalSearchParams();
  const router = useRouter();
  const validated = string().safeParse(params.entryId);
  const entryId = validated.success ? validated.data : '';
  const queryResult = entryService.useWeightEntry(entryId, [entryId]);
  const entry = queryResult.data;
  useEffect(() => {
    if (params.entryId) {
      return;
    }
    entryService.addWeightEntry(user.id).then((result) => {
      router.setParams({
        entryId: result.id,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.entryId]);

  useEffect(() => {
    if (!entry) {
      return;
    }
    setDate(entry.time);
    setWeight(entry.weight.weight);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  if (!queryResult.data || !entry) {
    return <LoadingBlock />;
  }
  const weight = entry.weight;
  const initialKilos = weightValue.toString().split('.')[0];
  const initalGrams = (weightValue.toString().split('.')[1] ?? '0').padEnd(2, '0');
  const setKilos = (value: string) => {
    const newValue = value + '.' + initalGrams;
    setWeight(Number(newValue));
    updateWeight(Number(newValue));
  };
  const setGrams = (value: string) => {
    const newValue = initialKilos + '.' + value;
    setWeight(Number(newValue));
    updateWeight(Number(newValue));
  };
  const updateDate = (date: Date) => {
    setDate(date);
    entryService.saveEntry({
      ...entry,
      time: date,
    });
  };
  const updateWeight = (weight: number) => {
    entryService.saveEntry({
      ...entry,
      weight: {
        ...entry.weight,
        weight: weight,
      },
    });
  };
  const dateToString = (date: Date):string => {
    return [
      date.toLocaleDateString(),
      [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0'),
      ].join(':'),
    ].join(' ');
  };
  const weightString = (weight: number) => {
    const parts = weight.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    return `${integerPart}.${(decimalPart ?? '0').padEnd(2, '0')}`;
  };

  const deleteEntry = async () => {
    await entryService.deleteEntry(entryId);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView style={{minHeight: '100%'}}>
        <ThemedView style={styles.container}>
          <Stack.Screen options={{title: `Weight Entry ${weight.id}`, headerShown: true}} />
          <ThemedBlock>
            <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
              <ThemedText style={{flexGrow: 1}}>Body Weight</ThemedText>
              <ThemedText onPress={() => setWeightModalVisible(true)}>{weightString(weightValue)} {weight.units}</ThemedText>
            </View>
            <Separator/>
            <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
              <ThemedText style={{flexGrow: 1}}>Date</ThemedText>
              <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
            </View>
            <Separator/>
            <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
              <ThemedText style={{flexGrow: 1}}>Synced</ThemedText>
              <EntrySyncButton entry={queryResult.data} />
            </View>
            <Separator />
                <View style={{flexDirection: 'row', justifyContent: 'center', gap: 40}}>

                  <ThemedLink onPress={deleteEntry}>Delete</ThemedLink>
                </View>
          </ThemedBlock>
        </ThemedView>
        <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
        <Modal visible={weightModalVisible} transparent animationType="none">
          <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
            <View style={{backgroundColor: theme.surface}}>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <ThemedLink style={{fontSize: 16, margin: theme.marginS}} onPress={() => setWeightModalVisible(false)}>Done</ThemedLink>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <WheelPicker items={kilograms} initialValue={initialKilos} onChange={(item) => setKilos(item)} style={{flexGrow: 1}} />
                <WheelPicker items={grams} initialValue={initalGrams} onChange={(item) => setGrams(item)} style={{flexGrow: 1}} />
              </View>
            </View>
          </View>
        </Modal>
      </ThemedScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: theme.paddingM,
    marginBottom: 80,
    gap: theme.marginL,
    flex: 1,
    flexGrow: 1,
  },
});
