CREATE TABLE `llm_config` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`provider` text DEFAULT 'ollama' NOT NULL,
	`base_url` text DEFAULT 'http://localhost:11434/v1' NOT NULL,
	`model` text DEFAULT 'llama3.2' NOT NULL,
	`api_key` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`payment_hash` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`amount_sat` integer NOT NULL,
	`description` text,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`raw` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `phoenix_config` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`host` text DEFAULT '127.0.0.1' NOT NULL,
	`port` text DEFAULT '9740' NOT NULL,
	`protocol` text DEFAULT 'http' NOT NULL,
	`password` text DEFAULT '' NOT NULL
);
