-- CreateTable
CREATE TABLE `contributions` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `contributor_id` VARCHAR(191) NOT NULL,
    `type` ENUM('edit', 'add_example', 'add_question') NOT NULL,
    `content` TEXT NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `moderator_id` VARCHAR(191) NULL,
    `moderator_note` TEXT NULL,
    `points_awarded` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `approved_at` DATETIME(3) NULL,

    INDEX `idx_contributions_post_status`(`post_id`, `status`),
    INDEX `idx_contributions_contributor`(`contributor_id`),
    INDEX `idx_contributions_status_time`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_contributor_id_fkey` FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contributions` ADD CONSTRAINT `contributions_moderator_id_fkey` FOREIGN KEY (`moderator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
