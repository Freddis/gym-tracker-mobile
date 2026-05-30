import {useAuth} from './useAuth';

export const useUser = () => {
  const {user} = useAuth();
  if (!user) {
    throw new Error('No user');
  }
  return user;
};
