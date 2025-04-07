PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`difficulty` integer,
	`equipmentId` integer NOT NULL,
	`images` text NOT NULL,
	`params` text NOT NULL,
	`userId` integer,
	`copiedFromId` integer,
	`parentExerciseId` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
PRAGMA foreign_keys=ON;