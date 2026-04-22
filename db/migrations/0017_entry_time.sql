CREATE TABLE `__new_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`type` text NOT NULL,
	`userId` integer NOT NULL,
	`workoutId` integer,
	`weightId` integer,
	`visibility` text NOT NULL,
	`createdAt` integer NOT NULL,
  `time` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`weightId`) REFERENCES `weight`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX `entries_externalId_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_externalId_unique` ON `__new_entries` (`externalId`);
--> statement-breakpoint
INSERT INTO __new_entries (id,externalId, type, userId, workoutId, weightId, visibility, createdAt, time, updatedAt, deletedAt, lastPulledAt, lastPushedAt)
SELECT id, externalId, type, userId, workoutId, weightId, visibility, createdAt, createdAt, updatedAt, deletedAt, lastPulledAt, lastPushedAt
FROM entries;
--> statement-breakpoint
DROP TABLE entries;
--> statement-breakpoint
ALTER TABLE __new_entries RENAME TO entries;