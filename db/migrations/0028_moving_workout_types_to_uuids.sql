PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout_type` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`planIndex` integer,
	`planId` text,
	`name` text,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_workout_type`("id", "userId", "planIndex", "planId", "name", "description", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt") SELECT "id", "userId", "planIndex", "planId", "name", "description", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt" FROM `workout_type`;--> statement-breakpoint
DROP TABLE `workout_type`;--> statement-breakpoint
ALTER TABLE `__new_workout_type` RENAME TO `workout_type`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_workout_type_exercise_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reps` integer,
	`exerciseId` text NOT NULL,
	`workoutTypeId` text NOT NULL,
	`userId` integer NOT NULL,
	`workoutTypeExerciseId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutTypeId`) REFERENCES `workout_type`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutTypeExerciseId`) REFERENCES `workout_type_exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workout_type_exercise_sets`("id", "reps", "exerciseId", "workoutTypeId", "userId", "workoutTypeExerciseId", "createdAt", "updatedAt", "deletedAt") SELECT "id", "reps", "exerciseId", "workoutTypeId", "userId", "workoutTypeExerciseId", "createdAt", "updatedAt", "deletedAt" FROM `workout_type_exercise_sets`;--> statement-breakpoint
DROP TABLE `workout_type_exercise_sets`;--> statement-breakpoint
ALTER TABLE `__new_workout_type_exercise_sets` RENAME TO `workout_type_exercise_sets`;--> statement-breakpoint
CREATE TABLE `__new_workout_type_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`index` integer NOT NULL,
	`workoutTypeId` text NOT NULL,
	`exerciseId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	FOREIGN KEY (`workoutTypeId`) REFERENCES `workout_type`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_workout_type_exercise`("id", "userId", "index", "workoutTypeId", "exerciseId", "createdAt", "updatedAt", "deletedAt") SELECT "id", "userId", "index", "workoutTypeId", "exerciseId", "createdAt", "updatedAt", "deletedAt" FROM `workout_type_exercise`;--> statement-breakpoint
DROP TABLE `workout_type_exercise`;--> statement-breakpoint
ALTER TABLE `__new_workout_type_exercise` RENAME TO `workout_type_exercise`;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`typeId` text,
	`userId` integer NOT NULL,
	`calories` real NOT NULL,
	`start` integer NOT NULL,
	`end` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	FOREIGN KEY (`typeId`) REFERENCES `workout_type`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "externalId", "typeId", "userId", "calories", "start", "end", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt") SELECT "id", "externalId", "typeId", "userId", "calories", "start", "end", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
CREATE UNIQUE INDEX `workouts_externalId_unique` ON `workouts` (`externalId`);