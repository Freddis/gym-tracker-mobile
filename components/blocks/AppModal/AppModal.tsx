import {FC} from 'react';
import {View, Button} from 'react-native';
import {AppModalProps} from './types/AppModalProps';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {Modal} from 'react-native-reanimated-modal';


export const AppModal: FC<AppModalProps> = (props) => {
  const theme = useAppTheme();
  return (
    <Modal visible={props.visible} animation="slide" onHide={props.onClose} onBackdropPress={props.onClose} style={{justifyContent: 'flex-end'}}>
      <View className="bg-surface">
        <View className="flex-row justify-end">
          <Button title="Done" onPress={props.onClose} color={theme.accent}/>
        </View>
        <View className="p-m">
          {props.children}
        </View>
      </View>
    </Modal>
  );
};
