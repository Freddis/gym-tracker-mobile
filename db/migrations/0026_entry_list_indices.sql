CREATE INDEX `entries_type_deleted_time_id_idx` ON `entries` (`deletedAt`,`type`,`time`);--> statement-breakpoint
CREATE INDEX `entries_deleted_time_id_idx` ON `entries` (`deletedAt`,`time`);