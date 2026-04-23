CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`externalId` integer,
	`userId` integer NOT NULL,
	`url` text,
	`image` text,
	`type` text NOT NULL,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_externalId_unique` ON `images` (`externalId`);--> statement-breakpoint
ALTER TABLE `entries` ADD `title` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `note` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `imageId` integer REFERENCES images(id);