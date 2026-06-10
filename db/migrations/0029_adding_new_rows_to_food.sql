ALTER TABLE `food` ADD `barcode` real;--> statement-breakpoint
ALTER TABLE `food` ADD `calories` real;--> statement-breakpoint
ALTER TABLE `food` ADD `visibility` text DEFAULT 'Public' NOT NULL;--> statement-breakpoint
ALTER TABLE `food` ADD `copiedFromId` text;