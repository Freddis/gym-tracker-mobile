import {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '../ThemedText/ThemedText';
import {IconSymbol} from '../IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';

interface ThemedInputErrorProps {
  error: string | null
}
export const ThemedInputError: FC<ThemedInputErrorProps> = (props) => {
  const {error} = props;
  const theme = useAppTheme();
  const styles = getStyles(theme, !!error);
  return (
    <View style={styles.container}>
      <IconSymbol name="exclamationmark.circle" size={18} color={theme.dangerText}/>
      <ThemedText style={[styles.errorText]}>
        {error}
      </ThemedText>
    </View>
  );
};


const getStyles = (theme: Theme, error: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    opacity: error ? 1 : 0,
    marginTop: 5,
  },
  errorText: {
    color: theme.dangerText,
    fontSize: 14,
  },
});
