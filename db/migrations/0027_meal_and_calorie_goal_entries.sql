CREATE TABLE `calorie_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calories` real NOT NULL,
	`carbs` real,
	`protein` real,
	`fat` real,
	`start` integer NOT NULL,
	`end` integer
);
--> statement-breakpoint
CREATE TABLE `meal_food` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mealId` integer NOT NULL,
	`foodId` text NOT NULL,
	`amount` real NOT NULL,
	`unit` text NOT NULL,
	FOREIGN KEY (`mealId`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`foodId`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `entries` ADD `mealId` integer REFERENCES meals(id);--> statement-breakpoint
ALTER TABLE `entries` ADD `calorieGoalId` integer REFERENCES calorie_goals(id);