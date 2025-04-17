ALTER TABLE `exercises` ADD `lastPulledAt` integer;--> statement-breakpoint
ALTER TABLE `exercises` ADD `lastPushedAt` integer;--> statement-breakpoint
ALTER TABLE `workouts` ADD `lastPulledAt` integer;--> statement-breakpoint
ALTER TABLE `workouts` ADD `lastPushedAt` integer;--> statement-breakpoint
ALTER TABLE `workouts` DROP COLUMN `syncedAt`;