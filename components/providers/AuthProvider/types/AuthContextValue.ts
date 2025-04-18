import {AuthUser} from './AuthUser';

export interface AuthContextValue {
  user: AuthUser | null
  ready: boolean
  login(user: AuthUser): void;
  logout(): void
}
