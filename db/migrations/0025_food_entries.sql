CREATE TABLE `food` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`imageId` integer,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`servingSize` real,
	`servingSizeUnit` text NOT NULL,
	`isMeal` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `food_components` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`foodId` text NOT NULL,
	`componentId` text NOT NULL,
	`amount` real NOT NULL,
	`unit` text NOT NULL,
	FOREIGN KEY (`foodId`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`componentId`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE restrict
);
