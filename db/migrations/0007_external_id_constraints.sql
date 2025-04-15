CREATE UNIQUE INDEX `exercises_externalId_unique` ON `exercises` (`externalId`);--> statement-breakpoint
CREATE UNIQUE INDEX `workout_exercise_sets_externalId_unique` ON `workout_exercise_sets` (`externalId`);--> statement-breakpoint
CREATE UNIQUE INDEX `workout_exercises_externalId_unique` ON `workout_exercises` (`externalId`);--> statement-breakpoint
CREATE UNIQUE INDEX `workouts_externalId_unique` ON `workouts` (`externalId`);