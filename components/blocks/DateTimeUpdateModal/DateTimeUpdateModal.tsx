import {FC, useEffect, useState} from 'react';
import {Button, View} from 'react-native';
import {AppWheelPicker} from '../AppWheelPicker/AppWheelPicker';
import {AppWheelPickerModal} from '../AppWheelPickerModal/AppWheelPickerModal';
import {AppPickerItem} from '../AppWheelPicker/type/AppPickerItem';
import {AppModalCloseButton} from '../AppModal/components/AppModalCloseButton';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentYear = new Date().getFullYear();

const getDayValue = (date: Date) => {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
};
const days: AppPickerItem<number>[] = (() => {
  const result: AppPickerItem<number>[] = [];
  const start = new Date();
  start.setFullYear(start.getFullYear() - 5);
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  end.setHours(0, 0, 0, 0);
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const dayName = DAY_LABELS[cursor.getDay()];
    const dayNum = cursor.getDate();
    const monthName = MONTH_LABELS[cursor.getMonth()];
    const year = cursor.getFullYear();
    const yearString = year === currentYear ? '' : `, ${year}`;
    const label = `${dayName} ${dayNum} ${monthName}${yearString}`;
    const value = getDayValue(cursor);
    result.push({label, value});
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
})();

const hours: AppPickerItem<string>[] = [];
for (let i = 0; i < 24; i++) {
  hours.push({label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0')});
}

const minutes: AppPickerItem<string>[] = [];
for (let i = 0; i < 60; i++) {
  minutes.push({label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0')});
}
type DateTimeUpdateModalProps = {
  date: Date;
  visible: boolean;
  onClose: () => void;
  onUpdate: (date: Date) => void;
};
export const DateTimeUpdateModal: FC<DateTimeUpdateModalProps> = (props) => {
  const [date, setDate] = useState(props.date);
  const selectedDay = getDayValue(date);
  const selectedHour = date.getHours().toString().padStart(2, '0');
  const selectedMinute = date.getMinutes().toString().padStart(2, '0');
  useEffect(() => {
    setDate(props.date);
  }, [props.date]);

  const setDay = (value: number) => {
    const newDate = new Date(value);
    newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    props.onUpdate(newDate);
  };
  const setHour = (value: string) => {
    const newDate = new Date(date.getTime());
    newDate.setHours(Number(value), date.getMinutes(), 0, 0);
    props.onUpdate(newDate);
  };
  const setMinute = (value: string) => {
    const newDate = new Date(date.getTime());
    newDate.setHours(date.getHours(), Number(value), 0, 0);
    props.onUpdate(newDate);
  };
  const now = () => {
    const newDate = new Date();
    setDate(newDate);
    props.onUpdate(newDate);
  };
  const header = (
    <View className="w-full flex-row gap-s justify-between">
      <Button title="Now" onPress={now} className="color-on-main" />
      <AppModalCloseButton onClose={props.onClose} />
    </View>
  );
  return (
    <AppWheelPickerModal visible={props.visible} onClose={props.onClose} customHeader={header}>
      <View className="flex-row gap-s">
        <View className="flex-2">
          <AppWheelPicker
            data={days}
            value={selectedDay}
            onValueChanged={(item) => setDay(item.item.value)}
          />
        </View>
        <View className="flex-1">
          <AppWheelPicker
            data={hours}
            value={selectedHour}
            onValueChanged={(item) => setHour(item.item.value)}
          />
        </View>
        <View className="flex-1">
          <AppWheelPicker
            data={minutes}
            value={selectedMinute}
            onValueChanged={(item) => setMinute(item.item.value)}
          />
        </View>
      </View>
    </AppWheelPickerModal>
  );
};
