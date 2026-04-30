import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {ThemedView} from '../../../blocks/ThemedView/ThemedView';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {Theme} from '../../../../types/Colors';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {RoutePath} from '../../../../types/RoutePath';

export const EntryAddScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  const items: [string, RoutePath][] = [
    ['Workout', '/app/entries/editWorkout'],
    ['Weight', '/app/entries/editWeight'],
    ['Post', '/app/entries/createPost'],
  ];
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{title: 'Add Entry', headerShown: true}} />
       <ThemedScrollView style={{minHeight: '100%'}}>
       <ThemedView style={styles.container}>
      <ThemedButtonList items={items} replace={true} />
      </ThemedView>
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
