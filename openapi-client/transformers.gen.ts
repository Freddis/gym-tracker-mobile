// This file is auto-generated by @hey-api/openapi-ts

import type {
  GetExercisesResponse,
  PutExercisesResponse,
  GetExercisesByIdResponse,
  GetWorkoutsResponse,
  PutWorkoutsResponse,
  GetWorkoutsByIdResponse,
  GetEntriesResponse,
} from "./types.gen";

const exerciseSchemaResponseTransformer = (data: any) => {
  data.createdAt = new Date(data.createdAt);
  if (data.updatedAt) {
    data.updatedAt = new Date(data.updatedAt);
  }
  if (data.deletedAt) {
    data.deletedAt = new Date(data.deletedAt);
  }
  return data;
};

export const getExercisesResponseTransformer = async (
  data: any
): Promise<GetExercisesResponse> => {
  data.items = data.items.map((item: any) => {
    return exerciseSchemaResponseTransformer(item);
  });
  return data;
};

export const putExercisesResponseTransformer = async (
  data: any
): Promise<PutExercisesResponse> => {
  data.items = data.items.map((item: any) => {
    return exerciseSchemaResponseTransformer(item);
  });
  return data;
};

export const getExercisesByIdResponseTransformer = async (
  data: any
): Promise<GetExercisesByIdResponse> => {
  data.item = exerciseSchemaResponseTransformer(data.item);
  return data;
};

const workoutExerciseSetSchemaResponseTransformer = (data: any) => {
  if (data.start) {
    data.start = new Date(data.start);
  }
  if (data.end) {
    data.end = new Date(data.end);
  }
  data.createdAt = new Date(data.createdAt);
  if (data.updatedAt) {
    data.updatedAt = new Date(data.updatedAt);
  }
  return data;
};

const workoutExerciseSchemaResponseTransformer = (data: any) => {
  data.createdAt = new Date(data.createdAt);
  if (data.updatedAt) {
    data.updatedAt = new Date(data.updatedAt);
  }
  data.exercise = exerciseSchemaResponseTransformer(data.exercise);
  data.sets = data.sets.map((item: any) => {
    return workoutExerciseSetSchemaResponseTransformer(item);
  });
  return data;
};

const workoutSchemaResponseTransformer = (data: any) => {
  data.start = new Date(data.start);
  if (data.end) {
    data.end = new Date(data.end);
  }
  data.createdAt = new Date(data.createdAt);
  if (data.updatedAt) {
    data.updatedAt = new Date(data.updatedAt);
  }
  if (data.deletedAt) {
    data.deletedAt = new Date(data.deletedAt);
  }
  data.exercises = data.exercises.map((item: any) => {
    return workoutExerciseSchemaResponseTransformer(item);
  });
  return data;
};

export const getWorkoutsResponseTransformer = async (
  data: any
): Promise<GetWorkoutsResponse> => {
  data.items = data.items.map((item: any) => {
    return workoutSchemaResponseTransformer(item);
  });
  return data;
};

export const putWorkoutsResponseTransformer = async (
  data: any
): Promise<PutWorkoutsResponse> => {
  data.items = data.items.map((item: any) => {
    item.start = new Date(item.start);
    if (item.end) {
      item.end = new Date(item.end);
    }
    item.createdAt = new Date(item.createdAt);
    if (item.updatedAt) {
      item.updatedAt = new Date(item.updatedAt);
    }
    if (item.deletedAt) {
      item.deletedAt = new Date(item.deletedAt);
    }
    return item;
  });
  return data;
};

export const getWorkoutsByIdResponseTransformer = async (
  data: any
): Promise<GetWorkoutsByIdResponse> => {
  data.item = workoutSchemaResponseTransformer(data.item);
  return data;
};

export const getEntriesResponseTransformer = async (
  data: any
): Promise<GetEntriesResponse> => {
  data.items = data.items.map((item: any) => {
    item.createdAt = new Date(item.createdAt);
    if (item.updatedAt) {
      item.updatedAt = new Date(item.updatedAt);
    }
    return item;
  });
  return data;
};
