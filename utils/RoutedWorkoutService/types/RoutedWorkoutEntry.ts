import {AppEntry} from '../../../types/models/AppEntry';
import {RoutedWorkoutType} from './RoutedWorkoutType';


export type RoutedWorkoutEntry<T = RoutedWorkoutType> = AppEntry & {type: T};
