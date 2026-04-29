CREATE TABLE `geo_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`outdoorRunId` integer NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real NOT NULL,
	`heartRate` real,
	`course` real,
	`speed` real,
	`speedAccuracy` real,
	`horizontalAccuracy` real,
	`verticalAccuracy` real,
	`distance` real,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`outdoorRunId`) REFERENCES `outdoor_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outdoor_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`userId` integer NOT NULL,
	`distance` real NOT NULL,
	`pace` real NOT NULL,
	`maxPace` real NOT NULL,
	`cadence` real,
	`maxCadence` real,
	`elevationGain` real,
	`heartRate` real,
	`maxHeartRate` real,
	`duration` integer NOT NULL,
	`calories` integer NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `outdoor_runs_externalId_unique` ON `outdoor_runs` (`externalId`);--> statement-breakpoint
ALTER TABLE `entries` ADD `outdoorRunId` integer REFERENCES outdoor_runs(id);