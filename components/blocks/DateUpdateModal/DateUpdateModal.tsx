import {FC, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {AppWheelPicker} from '../AppWheelPicker/AppWheelPicker';
import {AppWheelPickerModal} from '../AppWheelPickerModal/AppWheelPickerModal';
import {AppPickerItem} from '../AppWheelPicker/type/AppPickerItem';
import {AppModalCloseButton} from '../AppModal/components/AppModalCloseButton';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const currentYear = new Date().getFullYear();

const years: AppPickerItem<number>[] = Array.from(
  {length: 121},
  (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }),
);

const months: AppPickerItem<number>[] = MONTHS.map((month, index) => ({
  label: month,
  value: index,
}));

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

type BirthdayPickerModalProps = {
  date: Date;
  visible: boolean;
  onClose: () => void;
  onUpdate: (date: Date) => void;
};

export const DateUpdateModal: FC<BirthdayPickerModalProps> = ({
  date,
  visible,
  onClose,
  onUpdate,
}) => {
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const selectedDay = selectedDate.getDate();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const dayItems = useMemo<AppPickerItem<number>[]>(() => {
    const count = getDaysInMonth(selectedYear, selectedMonth);

    return Array.from({length: count}, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    }));
  }, [selectedYear, selectedMonth]);

  const updateDate = (
    day: number,
    month: number,
    year: number,
  ) => {
    const maxDay = getDaysInMonth(year, month);
    const safeDay = Math.min(day, maxDay);

    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    newDate.setMonth(month);
    newDate.setDate(safeDay);

    setSelectedDate(newDate);
    onUpdate(newDate);
  };

  const header = (
    <View className="w-full flex-row justify-end">
      <AppModalCloseButton onClose={onClose} />
    </View>
  );

  return (
    <AppWheelPickerModal
      visible={visible}
      onClose={onClose}
      customHeader={header}>
      <View className="flex-row gap-s">
        <View className="flex-1">
          <AppWheelPicker
            data={dayItems}
            value={selectedDay}
            onValueChanged={(item) =>
              updateDate(
                item.item.value,
                selectedMonth,
                selectedYear,
              )
            }
          />
        </View>

        <View className="flex-2">
          <AppWheelPicker
            data={months}
            value={selectedMonth}
            onValueChanged={(item) =>
              updateDate(
                selectedDay,
                item.item.value,
                selectedYear,
              )
            }
          />
        </View>

        <View className="flex-1">
          <AppWheelPicker
            data={years}
            value={selectedYear}
            onValueChanged={(item) =>
              updateDate(
                selectedDay,
                selectedMonth,
                item.item.value,
              )
            }
          />
        </View>
      </View>
    </AppWheelPickerModal>
  );
};
