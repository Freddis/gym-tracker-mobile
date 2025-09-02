PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`externalId` integer,
	`name` text NOT NULL,
	`description` text,
	`difficulty` integer,
	`equipment` text,
	`images` text NOT NULL,
	`params` text NOT NULL,
	`userId` integer,
	`copiedFromId` integer,
	`parentExerciseId` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "externalId", "name", "description", "difficulty", "equipment", "images", "params", "userId", "copiedFromId", "parentExerciseId", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt") SELECT "id", "externalId", "name", "description", "difficulty", "equipment", "images", "params", "userId", "copiedFromId", "parentExerciseId", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_externalId_unique` ON `exercises` (`externalId`);