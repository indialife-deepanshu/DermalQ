CREATE TABLE `skin_reports` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(21) NOT NULL,
	`age` int,
	`gender` varchar(20),
	`localization` varchar(30),
	`image_url` varchar(512) NOT NULL,
	`model_id` varchar(50),
	`model_name` varchar(100),
	`analysis_result` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skin_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `skin_reports` ADD CONSTRAINT `skin_reports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;