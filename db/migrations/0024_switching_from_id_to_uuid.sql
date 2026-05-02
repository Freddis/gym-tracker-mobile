PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text,
	`note` text,
	`userId` integer NOT NULL,
	`workoutId` integer,
	`imageId` integer,
	`weightId` integer,
	`outdoorRunId` integer,
	`outdoorWalkId` integer,
	`visibility` text NOT NULL,
	`time` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	`externalId` text,
	`externalSource` text,
	`healthkitId` text,
	`healthkitAnchor` integer,
	`healthkitAnchors_3_0` text,
	`healthkitSource` text,
	`healthkitSourceName` text,
	`healthkitDevice` text,
	`healthkitDeviceName` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`weightId`) REFERENCES `weight`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outdoorRunId`) REFERENCES `outdoor_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outdoorWalkId`) REFERENCES `outdoor_walks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_entries`("id", "type", "title", "note", "userId", "workoutId", "imageId", "weightId", "outdoorRunId", "outdoorWalkId", "visibility", "time", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt", "externalId", "externalSource", "healthkitId", "healthkitAnchor", "healthkitAnchors_3_0", "healthkitSource", "healthkitSourceName", "healthkitDevice", "healthkitDeviceName") SELECT "id", "type", "title", "note", "userId", "workoutId", "imageId", "weightId", "outdoorRunId", "outdoorWalkId", "visibility", "time", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt", "externalId", "externalSource", "healthkitId", "healthkitAnchor", "healthkitAnchors_3_0", "healthkitSource", "healthkitSourceName", "healthkitDevice", "healthkitDeviceName" FROM `entries`;--> statement-breakpoint
DROP TABLE `entries`;--> statement-breakpoint
ALTER TABLE `__new_entries` RENAME TO `entries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`difficulty` integer,
	`equipment` text,
	`images` text NOT NULL,
	`params` text NOT NULL,
	`userId` integer,
	`copiedFromId` text,
	`parentExerciseId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "name", "description", "difficulty", "equipment", "images", "params", "userId", "copiedFromId", "parentExerciseId", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt") SELECT "id", "name", "description", "difficulty", "equipment", "images", "params", "userId", "copiedFromId", "parentExerciseId", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
DROP INDEX `images_externalId_unique`;--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `externalId`;--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `lastPulledAt`;--> statement-breakpoint
ALTER TABLE `images` DROP COLUMN `lastPushedAt`;--> statement-breakpoint
CREATE TABLE `__new_muscles` (
	`id` integer PRIMARY KEY NOT NULL,
	`exerciseId` text NOT NULL,
	`isPrimary` integer NOT NULL,
	`muscle` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_muscles`("id", "exerciseId", "isPrimary", "muscle") SELECT "id", "exerciseId", "isPrimary", "muscle" FROM `muscles`;--> statement-breakpoint
DROP TABLE `muscles`;--> statement-breakpoint
ALTER TABLE `__new_muscles` RENAME TO `muscles`;--> statement-breakpoint
CREATE INDEX `muscle_idx` ON `muscles` (`muscle`);--> statement-breakpoint
CREATE TABLE `__new_workout_exercise_sets` (
	`id` integer PRIMARY KEY NOT NULL,
	`exerciseId` text NOT NULL,
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
INSERT INTO `__new_workout_exercise_sets`("id", "exerciseId", "workoutExerciseId", "userId", "workoutId", "start", "end", "finished", "weight", "reps", "createdAt", "updatedAt") SELECT "id", "exerciseId", "workoutExerciseId", "userId", "workoutId", "start", "end", "finished", "weight", "reps", "createdAt", "updatedAt" FROM `workout_exercise_sets`;--> statement-breakpoint
DROP TABLE `workout_exercise_sets`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercise_sets` RENAME TO `workout_exercise_sets`;--> statement-breakpoint
CREATE TABLE `__new_workout_exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`workoutId` integer NOT NULL,
	`exerciseId` text NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workout_exercises`("id", "workoutId", "exerciseId", "userId", "createdAt", "updatedAt") SELECT "id", "workoutId", "exerciseId", "userId", "createdAt", "updatedAt" FROM `workout_exercises`;--> statement-breakpoint
DROP TABLE `workout_exercises`;--> statement-breakpoint
ALTER TABLE `__new_workout_exercises` RENAME TO `workout_exercises`;--> statement-breakpoint
CREATE TABLE `__new_workout_type_exercise_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reps` integer,
	`exerciseId` text NOT NULL,
	`workoutTypeId` integer NOT NULL,
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
	`workoutTypeId` integer NOT NULL,
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
ALTER TABLE `outdoor_run_geo_data` DROP COLUMN `heartRate`;