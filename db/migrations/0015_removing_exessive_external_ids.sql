DROP INDEX `workout_exercise_sets_externalId_unique`;--> statement-breakpoint
ALTER TABLE `workout_exercise_sets` DROP COLUMN `externalId`;--> statement-breakpoint
DROP INDEX `workout_exercises_externalId_unique`;--> statement-breakpoint
ALTER TABLE `workout_exercises` DROP COLUMN `externalId`;