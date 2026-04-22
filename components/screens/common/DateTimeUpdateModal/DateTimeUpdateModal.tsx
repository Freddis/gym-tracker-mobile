import {FC, useEffect, useState} from 'react';
import {Button, Modal, View} from 'react-native';
import {WheelPicker, WheelPickerItemProps} from 'react-native-ui-lib';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const days: WheelPickerItemProps<string>[] = (() => {
  const result: WheelPickerItemProps<string>[] = [];
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  start.setHours(0, start.getTimezoneOffset(), 0, 0);
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  end.setHours(0, 0, 0, 0);
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const dayName = DAY_LABELS[cursor.getDay()];
    const dayNum = cursor.getDate();
    const monthName = MONTH_LABELS[cursor.getMonth()];
    const label = `${dayName} ${dayNum} ${monthName}`;
    const value = cursor.toISOString().slice(0, 10);
    result.push({label, value});
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
})();

const hours: WheelPickerItemProps<string>[] = [];
for (let i = 0; i < 24; i++) {
  hours.push({label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0')});
}

const minutes: WheelPickerItemProps<string>[] = [];
for (let i = 0; i < 60; i++) {
  minutes.push({label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0')});
}
export type DateTimeUpdateModalProps = {
  date: Date;
  visible: boolean;
  onClose: () => void;
  onUpdate: (date: Date) => void;
};
export const DateTimeUpdateModal: FC<DateTimeUpdateModalProps> = (props) => {
  const [date, setDate] = useState(props.date);
  const initialDay = date.toISOString().slice(0, 10);
  const initialHour = date.getHours().toString().padStart(2, '0');
  const initialMinute = date.getMinutes().toString().padStart(2, '0');
  useEffect(() => {
    setDate(props.date);
  }, [props.date]);

  const setDay = (value: string) => {
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
  return (
    <Modal visible={props.visible} transparent animationType="none">
          <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
            <View style={{backgroundColor: 'white'}}>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Button title="Done" onPress={props.onClose} />
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <WheelPicker items={days} initialValue={initialDay} onChange={(item) => setDay(item)} style={{flexGrow: 1}} />
                <WheelPicker items={hours} initialValue={initialHour} onChange={(item) => setHour(item)} style={{flexGrow: 1}} />
                <WheelPicker items={minutes} initialValue={initialMinute} onChange={(item) => setMinute(item)} style={{flexGrow: 1}} />
              </View>
            </View>
          </View>
        </Modal>
  );
};
