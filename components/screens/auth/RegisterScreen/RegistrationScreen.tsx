import {Alert, View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {FC, useState} from 'react';
import {AppLogo} from '@/components/blocks/AppLogo/AppLogo';
import {ThemedButton} from '@/components/blocks/ThemedButton/ThemedButton';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {AppScreenContainer} from '@/components/blocks/AppScreenContainer/AppScreenContainer';
import {AppWheelPicker} from '@/components/blocks/AppWheelPicker/AppWheelPicker';
import {AppWheelPickerModal} from '@/components/blocks/AppWheelPickerModal/AppWheelPickerModal';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {useResponseErrors} from '@/hooks/useResponseErrors';
import {api} from '@/utils/api';
import {useAppPartialTranslation} from '@/utils/i18n/useAppPartialTranslation';
import {Country, Gender, RegisterData} from '../../../../openapi-client';
import {AppPickerItem} from '../../../blocks/AppWheelPicker/type/AppPickerItem';
import {DateUpdateModal} from '../../../blocks/DateUpdateModal/DateUpdateModal';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {Separator} from '../../../blocks/Separator/Separator';
import {ThemedDropDown} from '../../../blocks/ThemedDropDown/ThemedDropDown';
import {useLocales} from 'expo-localization';
import {nativeEnum} from 'zod';

export const RegistrationScreen: FC = () => {
  const locales = useLocales();
  const auth = useAuth();
  const router = useRouter();
  const t = useAppPartialTranslation((x) => x.pages.auth.registration);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [inProgress, setInProgress] = useState(false);
  const countryCode = locales[0].regionCode;
  const defaultCountry = nativeEnum(Country).safeParse(countryCode).data ?? Country.US;
  const [country, setCountry] = useState<Country>(defaultCountry);

  const defaultBirthday = new Date();
  defaultBirthday.setFullYear(defaultBirthday.getFullYear() - 18);
  const [birthDate, setBirthDate] = useState(defaultBirthday);
  const [height] = useState(100);

  const [birthDateModalVisible, setBirthDateModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const {errors, setErrors, hasSmartError} = useResponseErrors<RegisterData['body']>();

  const genderOptions: AppPickerItem<Gender>[] = Object.values(Gender).map((value) => ({
    label: t.f((x) => x.utils.objects.genders[value]),
    value,
  }));

  const countryOptions: AppPickerItem<Country>[] = Object.values(Country).map((value) => ({
    label: t.f((x) => x.utils.objects.countries[value]),
    value,
  }));

  const performRegistration = async () => {
    setInProgress(true);
    const response = await api.register({
      body: {name, email, password, passwordConfirmation, gender, country, birthDate, height},
    });

    if (response.error) {
      if (response.error.error.code === 'ValidationFailed') {
        console.log(response.error);
        setErrors(response.error.error.fieldErrors ?? []);
      }
      Alert.alert(t.p((x) => x.toasts.registrationFailedTitle), t.p((x) => x.toasts.registrationFailedMessage));
      setInProgress(false);
      return;
    }
    // Alert.alert(t.p((x) => x.toasts.registrationSuccess));
    await auth.login(response.data);
    router.navigate('/');
  };

  return (
    <AppScreenContainer className="h-full">
      <Stack.Screen
        options={{
          title: t.p((x) => x.heading),
          headerShown: true,
          headerLeft: () => <BackHeaderButton />,
        }}
      />
      <KeyboardAvoidingView keyboardVerticalOffset={120} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-xxl pt-xl gap-xl">
            <View className="items-center">
              <AppLogo horizontal />
            </View>
            <ThemedView className="gap-l">
              <View>
                <ThemedText className="mb-xs">{t.p((x) => x.form.labels.name)}</ThemedText>
                <ThemedTextInput hasError={hasSmartError((x) => x?.name)} value={name} onChangeText={setName} placeholder="" />
              </View>
              <View>
                <ThemedText className="mb-xs">{t.p((x) => x.form.labels.email)}</ThemedText>
                <ThemedTextInput hasError={hasSmartError((x) => x?.email)} value={email} onChangeText={setEmail} placeholder="" />
              </View>
              <View className="flex-row gap-m">
                <View className="flex-1">
                  <ThemedText className="mb-xs">{t.p((x) => x.form.labels.birthDate)}</ThemedText>
                  <ThemedDropDown
                    hasError={hasSmartError((x) => x?.birthDate)}
                    value={birthDate.toLocaleDateString()}
                    onPress={() => setBirthDateModalVisible(true)}
                  />
                </View>
                <View className="flex-1">
                  <ThemedText className="mb-xs">{t.p((x) => x.form.labels.gender)}</ThemedText>
                  <ThemedDropDown
                    hasError={hasSmartError((x) => x?.gender)}
                    value={t.f((x) => x.utils.objects.genders[gender])}
                    onPress={() => setGenderModalVisible(true)}
                  />
                </View>
              </View>
              <View>
                <ThemedText className="mb-xs">{t.p((x) => x.form.labels.country)}</ThemedText>
                <ThemedDropDown
                  hasError={hasSmartError((x) => x?.country)}
                  value={t.f((x) => x.utils.objects.countries[country])}
                  onPress={() => setCountryModalVisible(true)}
                />
              </View>
            </ThemedView>
            <Separator />
            <ThemedView className="gap-l">
              <View>
                <ThemedText className="mb-xs">{t.p((x) => x.form.labels.password)}</ThemedText>
                <ThemedTextInput
                  hasError={hasSmartError((x) => x?.password)}
                  value={password}
                  onChangeText={setPassword}
                  textContentType="password"
                  secureTextEntry
                  placeholder="••••••••"
                />
              </View>
              <View>
                <ThemedText className="mb-xs">{t.p((x) => x.form.labels.passwordConfirmation)}</ThemedText>
                <ThemedTextInput
                  hasError={hasSmartError((x) => x?.passwordConfirmation)}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  textContentType="password"
                  secureTextEntry
                  placeholder="••••••••"
                />
              </View>
            </ThemedView>
            <ThemedButton className="h-14" onPress={performRegistration} disabled={inProgress}>
              {inProgress ? t.p((x) => x.form.buttons.registerInProgress) : t.p((x) => x.form.buttons.register)}
            </ThemedButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DateUpdateModal
        visible={birthDateModalVisible}
        onClose={() => setBirthDateModalVisible(false)}
        date={birthDate}
        onUpdate={setBirthDate}
      />
      <AppWheelPickerModal visible={genderModalVisible} onClose={() => setGenderModalVisible(false)}>
        <AppWheelPicker
          data={genderOptions}
          value={gender}
          onValueChanged={(item) => setGender(item.item.value)}
        />
      </AppWheelPickerModal>
      <AppWheelPickerModal visible={countryModalVisible} onClose={() => setCountryModalVisible(false)}>
        <AppWheelPicker
          data={countryOptions}
          value={country}
          onValueChanged={(item) => setCountry(item.item.value)}
        />
      </AppWheelPickerModal>
    </AppScreenContainer>
  );
};
