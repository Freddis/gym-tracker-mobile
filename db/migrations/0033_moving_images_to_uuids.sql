CREATE TABLE `__new_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text,
	`note` text,
	`userId` integer NOT NULL,
	`workoutId` integer,
	`imageId` text,
	`weightId` integer,
	`outdoorRunId` integer,
	`outdoorWalkId` integer,
	`mealId` integer,
	`calorieGoalId` integer,
	`visibility` text NOT NULL,
	`time` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	`externalId` text,
	`externalSource` text,
	`healthkitId` text,
	`healthkitAnchor` integer,
	`healthkitAnchors_3_0` text,
	`healthkitSource` text,
	`healthkitSourceName` text,
	`healthkitDevice` text,
	`healthkitDeviceName` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`weightId`) REFERENCES `weight`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outdoorRunId`) REFERENCES `outdoor_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outdoorWalkId`) REFERENCES `outdoor_walks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mealId`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`calorieGoalId`) REFERENCES `calorie_goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_entries`("id", "type", "title", "note", "userId", "workoutId", "imageId", "weightId", "outdoorRunId", "outdoorWalkId", "mealId", "calorieGoalId", "visibility", "time", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt", "externalId", "externalSource", "healthkitId", "healthkitAnchor", "healthkitAnchors_3_0", "healthkitSource", "healthkitSourceName", "healthkitDevice", "healthkitDeviceName") SELECT "id", "type", "title", "note", "userId", "workoutId", NULL, "weightId", "outdoorRunId", "outdoorWalkId", "mealId", "calorieGoalId", "visibility", "time", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt", "externalId", "externalSource", "healthkitId", "healthkitAnchor", "healthkitAnchors_3_0", "healthkitSource", "healthkitSourceName", "healthkitDevice", "healthkitDeviceName" FROM `entries`;--> statement-breakpoint
DROP TABLE `entries`;--> statement-breakpoint
ALTER TABLE `__new_entries` RENAME TO `entries`;--> statement-breakpoint
CREATE INDEX `entries_type_deleted_time_id_idx` ON `entries` (`deletedAt`,`type`,`time`);--> statement-breakpoint
CREATE INDEX `entries_deleted_time_id_idx` ON `entries` (`deletedAt`,`time`);--> statement-breakpoint
CREATE TABLE `__new_food` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`description` text,
	`imageId` text,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`barcode` real,
	`calories` real,
	`visibility` text DEFAULT 'Public' NOT NULL,
	`copiedFromId` text,
	`servingSize` real,
	`servingSizeUnit` text NOT NULL,
	`isMeal` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`deletedAt` integer,
	`lastPulledAt` integer,
	`lastPushedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_food`("id", "userId", "name", "brand", "description", "imageId", "protein", "carbs", "fat", "barcode", "calories", "visibility", "copiedFromId", "servingSize", "servingSizeUnit", "isMeal", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt") SELECT "id", "userId", "name", "brand", "description", NULL, "protein", "carbs", "fat", "barcode", "calories", "visibility", "copiedFromId", "servingSize", "servingSizeUnit", "isMeal", "createdAt", "updatedAt", "deletedAt", "lastPulledAt", "lastPushedAt" FROM `food`;--> statement-breakpoint
CREATE TEMPORARY TABLE `__backup_food_components` AS SELECT * FROM `food_components`;--> statement-breakpoint
CREATE TEMPORARY TABLE `__backup_meal_food` AS SELECT * FROM `meal_food`;--> statement-breakpoint
DELETE FROM `food_components`;--> statement-breakpoint
DELETE FROM `meal_food`;--> statement-breakpoint
DROP TABLE `food`;--> statement-breakpoint
ALTER TABLE `__new_food` RENAME TO `food`;--> statement-breakpoint
INSERT INTO `food_components` SELECT * FROM `__backup_food_components`;--> statement-breakpoint
INSERT INTO `meal_food` SELECT * FROM `__backup_meal_food`;--> statement-breakpoint
DROP TABLE `__backup_food_components`;--> statement-breakpoint
DROP TABLE `__backup_meal_food`;--> statement-breakpoint
CREATE TABLE `__new_images` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`url` text,
	`image` text,
	`type` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `images`;--> statement-breakpoint
ALTER TABLE `__new_images` RENAME TO `images`;--> statement-breakpoint
UPDATE `exercises` SET `images` = '[]';