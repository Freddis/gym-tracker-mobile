PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout_exercise_sets` (
	`id` integer PRIMARY KEY NOT NULL,
	`externalId` integer,
	`exerciseId` integer NOT NULL,
	`workoutExerciseId` integer NOT NULL,
	`userId` integer NOT NULL,
	`workoutId` integer NOT NULL,
	`start` integer,
	`end` integer,
	`finished` integer NOT NULL,
	`weight` real,
	`reps` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workoutExerciseId`) REFERENCES `workout_exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workout_exercise_sets`("id", "externalId", "exerciseId", "workoutExerciseId", "userId", "workoutId", "start", "end", "finished", "weight", "reps", "createdAt", "updatedAt") SELECT "id", "externalId", "exerciseId", "workoutExerciseId", "userId", "workoutId", "start", "end", "finished", "weight", "reps", "createdAt", "updatedAt" FROM `workout_exercise_sets`;--> statement-breakpoint
DROP TABLE `workout_exercise_sets`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercise_sets` RENAME TO `workout_exercise_sets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_exercise_sets_externalId_unique` ON `workout_exercise_sets` (`externalId`);--> statement-breakpoint
CREATE TABLE `__new_workout_exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`externalId` integer,
	`workoutId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workout_exercises`("id", "externalId", "workoutId", "exerciseId", "userId", "createdAt", "updatedAt") SELECT "id", "externalId", "workoutId", "exerciseId", "userId", "createdAt", "updatedAt" FROM `workout_exercises`;--> statement-breakpoint
DROP TABLE `workout_exercises`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercises` RENAME TO `workout_exercises`;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_exercises_externalId_unique` ON `workout_exercises` (`externalId`);