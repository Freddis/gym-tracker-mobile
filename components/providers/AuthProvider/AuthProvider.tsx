import {FC, ReactNode, useEffect, useState} from 'react';
import {AuthContext} from './AuthContext';
import {authUserValidator, AuthUser} from './types/AuthUser';
import {ClientOptions, Config} from '@hey-api/client-axios';
import {client} from '@/openapi-client/client.gen';
import {deleteItemAsync, getItemAsync, setItemAsync} from 'expo-secure-store';
import {db, conflictUpdateSetAllColumns} from '../../../utils/drizzle';
import {schema} from '../../../db/schema';
import {Alert} from 'react-native';
import {AxiosError} from 'axios';
import * as Device from 'expo-device';

export const AuthProvider: FC<{children: ReactNode | ReactNode[]}> = (props) => {
  const userKey = 'user';
  const [doneLoading, setDoneLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getItemAsync(userKey);
    setDoneLoading(true);
    if (user === null) {
      return;
    }
    let parsedUser: unknown = {};
    try {
      parsedUser = JSON.parse(user);
    } catch {
      /* empty */
    }
    const result = authUserValidator.safeParse(parsedUser);
    if (result.success) {
      setUser(result.data);
    }
  };
  if (!doneLoading) {
    return null;
  }
  const getClientConfig = (user: AuthUser | null): Config<ClientOptions> => {
    const authHeader = user ? 'Bearer ' + user.jwt : 'nothing';
    const isSimulator = !Device.isDevice;
    const baseUrl = isSimulator ? 'http://192.168.0.16:3333/api' : 'https://discipline.alex-sarychev.com/api';
    const options: Config<ClientOptions> = {
      responseType: 'json',
      baseURL: baseUrl,
      headers: {
        Authorization: authHeader,
        apiVersion: '1.0.1',
      },
    };
    return options;
  };
  client.setConfig(getClientConfig(user));
  client.instance.interceptors.response.use(undefined, async (error: unknown) => {
    console.log('Error', error,);
    if (!(error instanceof AxiosError)) {
      return;
    }
    if (error.response?.data.error.code === 'ApiVersionMismatch') {
      Alert.alert('Api Version Mismatch', 'Please update the app to the latest version');
    }
  });
  const logout = () => {
    setUser(null);
    deleteItemAsync(userKey);
    client.setConfig(getClientConfig(null));
  };
  const login = async (user: AuthUser) => {
    setUser(user);
    const row: typeof schema.users.$inferInsert = {
      id: user.id,
      name: user.name,
      email: user.email,
      jwt: user.jwt,
      updatedAt: new Date(),
    };
    await db.insert(schema.users).values(row).onConflictDoUpdate({
      target: schema.users.id,
      set: conflictUpdateSetAllColumns(schema.users),
    });
    setItemAsync(userKey, JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{user, ready: doneLoading, login, logout}}>{props.children}</AuthContext.Provider>
  );
};
