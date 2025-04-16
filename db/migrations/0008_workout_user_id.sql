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
	`syncedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "externalId", "typeId", "userId", "calories", "start", "end", "createdAt", "updatedAt", "syncedAt") SELECT "id", "externalId", "typeId", "userId", "calories", "start", "end", "createdAt", "updatedAt", "syncedAt" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `workouts_externalId_unique` ON `workouts` (`externalId`);