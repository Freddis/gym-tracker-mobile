import {useRouter} from 'expo-router';

export type RoutePath = Parameters<ReturnType<typeof useRouter>['push']>[0]
