CREATE TABLE `muscles` (
	`id` integer PRIMARY KEY NOT NULL,
	`exerciseId` integer NOT NULL,
	`isPrimary` integer NOT NULL,
	`muscle` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `muscle_idx` ON `muscles` (`muscle`);