import {FC} from 'react';
import {Modal, View, Button} from 'react-native';
import {AppModalProps} from './types/AppModalProps';
import {useAppTheme} from '../../../hooks/useAppTheme';

export const AppModal: FC<AppModalProps> = (props) => {
  const theme = useAppTheme();
  return (
    <Modal visible={props.visible} transparent animationType="slide">
      <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000090'}}>
        <View style={{backgroundColor: theme.surface}}>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Button title="Done" onPress={props.onClose} color={theme.accent}/>
          </View>
          <View style={{flexDirection: 'column', padding: theme.paddingM}}>
            {props.children}
          </View>
        </View>
      </View>
    </Modal>
  );
};
