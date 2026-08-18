CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`date` text NOT NULL,
	`site_id` text,
	`layer_id` text,
	`title` text NOT NULL,
	`details` text,
	`source_url` text,
	`created_at` integer NOT NULL
);
