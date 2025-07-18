// This file is auto-generated by @hey-api/openapi-ts

import type {
  Options as ClientOptions,
  TDataShape,
  Client,
} from '@hey-api/client-axios';
import type {
  PostAuthRegisterData,
  PostAuthRegisterResponse,
  PostAuthRegisterError,
  PostAuthLoginData,
  PostAuthLoginResponse,
  PostAuthLoginError,
  GetExercisesData,
  GetExercisesResponse,
  GetExercisesError,
  PostExercisesData,
  PostExercisesResponse,
  PostExercisesError,
  PutExercisesData,
  PutExercisesResponse,
  PutExercisesError,
  DeleteExercisesByIdData,
  DeleteExercisesByIdResponse,
  DeleteExercisesByIdError,
  GetExercisesByIdData,
  GetExercisesByIdResponse,
  GetExercisesByIdError,
  PatchExercisesByIdData,
  PatchExercisesByIdResponse,
  PatchExercisesByIdError,
  GetWorkoutsData,
  GetWorkoutsResponse,
  GetWorkoutsError,
  PostWorkoutsData,
  PostWorkoutsResponse,
  PostWorkoutsError,
  PutWorkoutsData,
  PutWorkoutsResponse,
  PutWorkoutsError,
  DeleteWorkoutsByIdData,
  DeleteWorkoutsByIdResponse,
  DeleteWorkoutsByIdError,
  GetWorkoutsByIdData,
  GetWorkoutsByIdResponse,
  GetWorkoutsByIdError,
  PatchWorkoutsByIdData,
  PatchWorkoutsByIdResponse,
  PatchWorkoutsByIdError,
  PutWorkoutsByIdData,
  PutWorkoutsByIdResponse,
  PutWorkoutsByIdError,
  PostWeightData,
  PostWeightResponse,
  PostWeightError,
  GetArgusCheckinData,
  GetArgusCheckinResponse,
  GetArgusCheckinError,
  GetArgusCheckinTypesData,
  GetArgusCheckinTypesResponse,
  GetArgusCheckinTypesError,
} from './types.gen';
import {client as _heyApiClient} from './client.gen';
import {
  getExercisesResponseTransformer,
  putExercisesResponseTransformer,
  getExercisesByIdResponseTransformer,
  getWorkoutsResponseTransformer,
  putWorkoutsResponseTransformer,
  getWorkoutsByIdResponseTransformer,
  putWorkoutsByIdResponseTransformer,
  postWeightResponseTransformer,
  getArgusCheckinResponseTransformer,
} from './transformers.gen';

export type Options<
  TData extends TDataShape = TDataShape,
  ThrowOnError extends boolean = boolean
> = ClientOptions<TData, ThrowOnError> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
  /**
   * You can pass arbitrary values through the `meta` object. This can be
   * used to access values that aren't defined as part of the SDK function.
   */
  meta?: Record<string, unknown>;
};

/**
 * Registers a user
 */
export const postAuthRegister = <ThrowOnError extends boolean = false>(
  options?: Options<PostAuthRegisterData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).post<
    PostAuthRegisterResponse,
    PostAuthRegisterError,
    ThrowOnError
  >({
    url: '/auth/register',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Logins a user
 */
export const postAuthLogin = <ThrowOnError extends boolean = false>(
  options?: Options<PostAuthLoginData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).post<
    PostAuthLoginResponse,
    PostAuthLoginError,
    ThrowOnError
  >({
    url: '/auth/login',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Returns data on exercises available to the user
 */
export const getExercises = <ThrowOnError extends boolean = false>(
  options?: Options<GetExercisesData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).get<
    GetExercisesResponse,
    GetExercisesError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: getExercisesResponseTransformer,
    url: '/exercises',
    ...options,
  });
};

/**
 * Adds new exercise to the user personal library
 */
export const postExercises = <ThrowOnError extends boolean = false>(
  options?: Options<PostExercisesData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).post<
    PostExercisesResponse,
    PostExercisesError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/exercises',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Updates or inserts exercise in users personal library
 */
export const putExercises = <ThrowOnError extends boolean = false>(
  options?: Options<PutExercisesData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).put<
    PutExercisesResponse,
    PutExercisesError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: putExercisesResponseTransformer,
    url: '/exercises',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Deletes exercise from users personal library
 */
export const deleteExercisesById = <ThrowOnError extends boolean = false>(
  options: Options<DeleteExercisesByIdData, ThrowOnError>
) => {
  return (options.client ?? _heyApiClient).delete<
    DeleteExercisesByIdResponse,
    DeleteExercisesByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/exercises/{id}',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Returns data on an exercise available to the user
 */
export const getExercisesById = <ThrowOnError extends boolean = false>(
  options: Options<GetExercisesByIdData, ThrowOnError>
) => {
  return (options.client ?? _heyApiClient).get<
    GetExercisesByIdResponse,
    GetExercisesByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: getExercisesByIdResponseTransformer,
    url: '/exercises/{id}',
    ...options,
  });
};

/**
 * Updates exercise in users personal library
 */
export const patchExercisesById = <ThrowOnError extends boolean = false>(
  options: Options<PatchExercisesByIdData, ThrowOnError>
) => {
  return (options.client ?? _heyApiClient).patch<
    PatchExercisesByIdResponse,
    PatchExercisesByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/exercises/{id}',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Returns list of users workouts
 */
export const getWorkouts = <ThrowOnError extends boolean = false>(
  options?: Options<GetWorkoutsData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).get<
    GetWorkoutsResponse,
    GetWorkoutsError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: getWorkoutsResponseTransformer,
    url: '/workouts',
    ...options,
  });
};

/**
 * Adds new workout for the user
 */
export const postWorkouts = <ThrowOnError extends boolean = false>(
  options?: Options<PostWorkoutsData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).post<
    PostWorkoutsResponse,
    PostWorkoutsError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/workouts',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Updates or inserts workout for user
 */
export const putWorkouts = <ThrowOnError extends boolean = false>(
  options?: Options<PutWorkoutsData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).put<
    PutWorkoutsResponse,
    PutWorkoutsError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: putWorkoutsResponseTransformer,
    url: '/workouts',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Deletes workout from user
 */
export const deleteWorkoutsById = <ThrowOnError extends boolean = false>(
  options: Options<DeleteWorkoutsByIdData, ThrowOnError>
) => {
  return (options.client ?? _heyApiClient).delete<
    DeleteWorkoutsByIdResponse,
    DeleteWorkoutsByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/workouts/{id}',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Returns data on user workout
 */
export const getWorkoutsById = <ThrowOnError extends boolean = false>(
  options: Options<GetWorkoutsByIdData, ThrowOnError>
) => {
  return (options.client ?? _heyApiClient).get<
    GetWorkoutsByIdResponse,
    GetWorkoutsByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: getWorkoutsByIdResponseTransformer,
    url: '/workouts/{id}',
    ...options,
  });
};

/**
 * Updates workout of current user
 */
export const patchWorkoutsById = <ThrowOnError extends boolean = false>(
  options: Options<PatchWorkoutsByIdData, ThrowOnError>
) => {
  return (options.client ?? _heyApiClient).patch<
    PatchWorkoutsByIdResponse,
    PatchWorkoutsByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/workouts/{id}',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Updates or inserts workout for user
 */
export const putWorkoutsById = <ThrowOnError extends boolean = false>(
  options?: Options<PutWorkoutsByIdData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).put<
    PutWorkoutsByIdResponse,
    PutWorkoutsByIdError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: putWorkoutsByIdResponseTransformer,
    url: '/workouts/{id}',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Adds new weight entry for the user
 */
export const postWeight = <ThrowOnError extends boolean = false>(
  options?: Options<PostWeightData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).post<
    PostWeightResponse,
    PostWeightError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    responseTransformer: postWeightResponseTransformer,
    url: '/weight',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

/**
 * Returns data on all checkins from Argus
 */
export const getArgusCheckin = <ThrowOnError extends boolean = false>(
  options?: Options<GetArgusCheckinData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).get<
    GetArgusCheckinResponse,
    GetArgusCheckinError,
    ThrowOnError
  >({
    responseTransformer: getArgusCheckinResponseTransformer,
    url: '/argus/checkin',
    ...options,
  });
};

/**
 * Returns possible checkin types for Argus
 */
export const getArgusCheckinTypes = <ThrowOnError extends boolean = false>(
  options?: Options<GetArgusCheckinTypesData, ThrowOnError>
) => {
  return (options?.client ?? _heyApiClient).get<
    GetArgusCheckinTypesResponse,
    GetArgusCheckinTypesError,
    ThrowOnError
  >({
    security: [
      {
        name: 'authorization',
        type: 'apiKey',
      },
    ],
    url: '/argus/checkin/types',
    ...options,
  });
};
