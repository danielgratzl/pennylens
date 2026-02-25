CREATE TABLE `account_snapshot` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`snapshot_month` text NOT NULL,
	`value` real NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `investment_account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `app_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fixed_cost` (
	`id` text PRIMARY KEY NOT NULL,
	`item_group_id` text NOT NULL,
	`portfolio_id` text NOT NULL,
	`person_id` text,
	`category_id` text,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`is_yearly` integer DEFAULT false NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`effective_from` text NOT NULL,
	`effective_until` text,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `income` (
	`id` text PRIMARY KEY NOT NULL,
	`item_group_id` text NOT NULL,
	`portfolio_id` text NOT NULL,
	`person_id` text,
	`category_id` text,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`is_yearly` integer DEFAULT false NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`effective_from` text NOT NULL,
	`effective_until` text,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `investment_account` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`person_id` text,
	`category_id` text,
	`name` text NOT NULL,
	`account_type` text,
	`institution` text,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `person` (
	`id` text PRIMARY KEY NOT NULL,
	`portfolio_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolio`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
