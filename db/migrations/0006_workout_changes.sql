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
	`updatedAt` integer
);
--> statement-breakpoint
DROP TABLE `workout_exercise_sets`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercise_sets` RENAME TO `workout_exercise_sets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`typeId` integer,
	`userId` integer,
	`calories` real NOT NULL,
	`start` integer NOT NULL,
	`end` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`syncedAt` integer
);
--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;