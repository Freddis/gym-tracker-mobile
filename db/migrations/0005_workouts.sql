CREATE TABLE `workout_exercise_sets` (
	`id` integer PRIMARY KEY NOT NULL,
	`externalId` integer,
	`exerciseId` integer NOT NULL,
	`userId` integer NOT NULL,
	`workoutId` integer NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`weight` real,
	`reps` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`externalId` integer,
	`workoutId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`typeId` integer,
	`userId` integer,
	`calories` real NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer
);
