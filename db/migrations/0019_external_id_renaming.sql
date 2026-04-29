ALTER TABLE `entries` RENAME COLUMN "externalId" TO "remoteId";--> statement-breakpoint
DROP INDEX `entries_externalId_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `entries_remoteId_unique` ON `entries` (`remoteId`);