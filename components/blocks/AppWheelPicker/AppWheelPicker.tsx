import {styled} from 'nativewind';
import WheelPicker, {withVirtualized} from '@quidone/react-native-wheel-picker';
import {ValueChangedEvent} from '@quidone/react-native-wheel-picker/dest/typescript/base';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';
import {AppPickerItem} from './type/AppPickerItem';

const VirtualizedWheelPicker = withVirtualized(WheelPicker);
const NativeWindWheelPicker = styled(VirtualizedWheelPicker, {
  className: 'style',
  overlayItemClassName: 'overlayItemStyle',
  itemTextClassName: 'itemTextStyle',
  contentContainerClassName: 'contentContainerStyle',
});
interface AppWheelPickerProps<T, > {
  data: AppPickerItem<T>[];
  value: T;
  onValueChanged: (event: ValueChangedEvent<AppPickerItem<T>>) => void;
}

export const AppWheelPicker = <T, >(props: AppWheelPickerProps<T>) => {
  return (
  <NativeWindWheelPicker
    className="w-full"
    itemTextClassName="text-on-main"
    overlayItemClassName="bg-accent"
    data={props.data}
    value={props.value}
    onValueChanged={props.onValueChanged}
    onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
   />
  );
};
