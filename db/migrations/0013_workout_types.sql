CREATE TABLE `workout_type_exercise_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reps` integer,
	`exerciseId` integer NOT NULL,
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
CREATE TABLE `workout_type_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`index` integer NOT NULL,
	`workoutTypeId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	FOREIGN KEY (`workoutTypeId`) REFERENCES `workout_type`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `workout_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`userId` integer NOT NULL,
	`planIndex` integer,
	`planId` integer,
	`name` text,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_type_externalId_unique` ON `workout_type` (`externalId`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`typeId` integer,
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `workouts_externalId_unique` ON `workouts` (`externalId`);