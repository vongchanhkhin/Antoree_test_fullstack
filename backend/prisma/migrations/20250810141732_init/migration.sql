-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(32) NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels` (
    `id` VARCHAR(8) NOT NULL,
    `order_no` INTEGER NOT NULL,

    UNIQUE INDEX `levels_order_no_key`(`order_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `id` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` TEXT NULL,
    `provider` VARCHAR(20) NOT NULL DEFAULT 'local',
    `provider_id` VARCHAR(255) NOT NULL,
    `role_id` VARCHAR(32) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `ux_provider`(`provider`, `provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(50) NULL,
    `display_name` VARCHAR(100) NULL,
    `bio` TEXT NULL,
    `avatar_url` TEXT NULL,
    `level_id` VARCHAR(8) NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `reputation` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_username_key`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `badges_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `user_id` VARCHAR(191) NOT NULL,
    `badge_id` VARCHAR(191) NOT NULL,
    `earned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`, `badge_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(191) NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `level_id` VARCHAR(8) NULL,
    `skills` JSON NOT NULL,
    `status` ENUM('draft', 'published', 'rejected', 'deleted') NOT NULL DEFAULT 'draft',
    `hot_score` DECIMAL(16, 6) NOT NULL DEFAULT 0,
    `upvotes` INTEGER NOT NULL DEFAULT 0,
    `downvotes` INTEGER NOT NULL DEFAULT 0,
    `comments_count` INTEGER NOT NULL DEFAULT 0,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_posts_status_hot`(`status`, `hot_score` DESC, `created_at` DESC),
    INDEX `idx_posts_level`(`level_id`),
    FULLTEXT INDEX `ft_posts`(`title`, `content`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tags` (
    `post_id` VARCHAR(191) NOT NULL,
    `tag_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`post_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_media` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `kind` ENUM('image', 'audio', 'video') NOT NULL,
    `url` TEXT NOT NULL,
    `meta` JSON NOT NULL,

    INDEX `idx_media_post`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `upvotes` INTEGER NOT NULL DEFAULT 0,
    `downvotes` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('visible', 'hidden', 'deleted', 'rejected') NOT NULL DEFAULT 'visible',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_comments_post_time`(`post_id`, `created_at`),
    INDEX `idx_comments_parent`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_tree` (
    `ancestor_id` VARCHAR(191) NOT NULL,
    `descendant_id` VARCHAR(191) NOT NULL,
    `depth` INTEGER NOT NULL,

    INDEX `idx_ct_desc`(`descendant_id`),
    PRIMARY KEY (`ancestor_id`, `descendant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `votes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `target_type` ENUM('post', 'comment') NOT NULL,
    `target_id` VARCHAR(191) NOT NULL,
    `value` TINYINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_votes_target`(`target_type`, `target_id`),
    UNIQUE INDEX `ux_vote`(`user_id`, `target_type`, `target_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `reporter_id` VARCHAR(191) NULL,
    `target_type` ENUM('post', 'comment', 'user') NOT NULL,
    `target_id` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_queue` (
    `id` VARCHAR(191) NOT NULL,
    `target_type` ENUM('post', 'comment') NOT NULL,
    `target_id` VARCHAR(191) NOT NULL,
    `source` ENUM('report', 'auto_safety') NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `payload` JSON NOT NULL,
    `reviewer_id` VARCHAR(191) NULL,
    `decided_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ux_mod_unique`(`target_type`, `target_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artifacts` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NULL,
    `type` ENUM('quiz', 'flashcards', 'explain') NOT NULL,
    `status` ENUM('ready', 'generating', 'failed') NOT NULL DEFAULT 'ready',
    `meta` JSON NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_questions` (
    `id` VARCHAR(191) NOT NULL,
    `artifact_id` VARCHAR(191) NOT NULL,
    `stem` TEXT NOT NULL,
    `explanation` TEXT NULL,
    `order_no` INTEGER NOT NULL,

    INDEX `idx_qq_artifact`(`artifact_id`, `order_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_options` (
    `id` VARCHAR(191) NOT NULL,
    `question_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `is_correct` BOOLEAN NOT NULL DEFAULT false,

    INDEX `idx_qo_question`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `artifact_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `score` DECIMAL(5, 2) NOT NULL,
    `answers` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ux_submission`(`artifact_id`, `user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flashcards` (
    `id` VARCHAR(191) NOT NULL,
    `artifact_id` VARCHAR(191) NOT NULL,
    `front` TEXT NOT NULL,
    `back` TEXT NOT NULL,
    `example` TEXT NULL,
    `order_no` INTEGER NOT NULL,

    INDEX `idx_fc_artifact`(`artifact_id`, `order_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_media` ADD CONSTRAINT `post_media_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_tree` ADD CONSTRAINT `comment_tree_ancestor_id_fkey` FOREIGN KEY (`ancestor_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_tree` ADD CONSTRAINT `comment_tree_descendant_id_fkey` FOREIGN KEY (`descendant_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_queue` ADD CONSTRAINT `moderation_queue_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artifacts` ADD CONSTRAINT `artifacts_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artifacts` ADD CONSTRAINT `artifacts_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_artifact_id_fkey` FOREIGN KEY (`artifact_id`) REFERENCES `artifacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_options` ADD CONSTRAINT `quiz_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_submissions` ADD CONSTRAINT `quiz_submissions_artifact_id_fkey` FOREIGN KEY (`artifact_id`) REFERENCES `artifacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_submissions` ADD CONSTRAINT `quiz_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flashcards` ADD CONSTRAINT `flashcards_artifact_id_fkey` FOREIGN KEY (`artifact_id`) REFERENCES `artifacts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
