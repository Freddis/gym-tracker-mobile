CREATE TABLE `outdoor_walk_geo_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`outdoorWalkId` integer NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`altitude` real NOT NULL,
	`course` real,
	`speed` real,
	`speedAccuracy` real,
	`horizontalAccuracy` real,
	`verticalAccuracy` real,
	`distance` real,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`outdoorWalkId`) REFERENCES `outdoor_walks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outdoor_walk_heartrate_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`outdoorWalkId` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`heartRate` real NOT NULL,
	FOREIGN KEY (`outdoorWalkId`) REFERENCES `outdoor_walks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outdoor_walks` (
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
CREATE UNIQUE INDEX `outdoor_walks_externalId_unique` ON `outdoor_walks` (`externalId`);--> statement-breakpoint
ALTER TABLE `entries` ADD `outdoorWalkId` integer REFERENCES outdoor_walks(id);