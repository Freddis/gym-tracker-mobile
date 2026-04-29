ALTER TABLE `geo_data` RENAME TO `outdoor_run_geo_data`;--> statement-breakpoint
CREATE TABLE `outdoor_run_heartrate_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`outdoorRunId` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`heartRate` real NOT NULL,
	FOREIGN KEY (`outdoorRunId`) REFERENCES `outdoor_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_outdoor_run_geo_data` (
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
INSERT INTO `__new_outdoor_run_geo_data`("id", "outdoorRunId", "latitude", "longitude", "altitude", "heartRate", "course", "speed", "speedAccuracy", "horizontalAccuracy", "verticalAccuracy", "distance", "timestamp") SELECT "id", "outdoorRunId", "latitude", "longitude", "altitude", "heartRate", "course", "speed", "speedAccuracy", "horizontalAccuracy", "verticalAccuracy", "distance", "timestamp" FROM `outdoor_run_geo_data`;--> statement-breakpoint
DROP TABLE `outdoor_run_geo_data`;--> statement-breakpoint
ALTER TABLE `__new_outdoor_run_geo_data` RENAME TO `outdoor_run_geo_data`;--> statement-breakpoint
PRAGMA foreign_keys=ON;