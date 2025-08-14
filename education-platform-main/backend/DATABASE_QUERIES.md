# Database Management Commands

## Quick Database Operations

### View All Tables
```sql
SHOW TABLES;
```

### Check Table Structure
```sql
DESCRIBE users;
DESCRIBE posts;
DESCRIBE comments;
```

### Sample Data Queries

#### Get All Roles
```sql
SELECT * FROM roles;
```

#### Get All CEFR Levels
```sql
SELECT * FROM levels ORDER BY order_no;
```

#### Get All Skills
```sql
SELECT * FROM skills;
```

#### Get All Badges
```sql
SELECT * FROM badges;
```

### User Management Queries

#### Create a Sample Teacher
```sql
INSERT INTO users (id, email, password_hash, role_id, provider, provider_id) 
VALUES ('teacher-001', 'teacher@example.com', '$2b$10$hashedpassword', 'teacher', 'local', 'teacher@example.com');

INSERT INTO profiles (user_id, username, display_name, bio, level_id, points, reputation)
VALUES ('teacher-001', 'english_teacher', 'Sarah Johnson', 'Experienced English teacher with 10 years of experience', 'C2', 1500, 250);
```

#### Create a Sample Student
```sql
INSERT INTO users (id, email, password_hash, role_id, provider, provider_id) 
VALUES ('student-001', 'student@example.com', '$2b$10$hashedpassword', 'learner', 'local', 'student@example.com');

INSERT INTO profiles (user_id, username, display_name, bio, level_id, points, reputation)
VALUES ('student-001', 'english_learner', 'John Smith', 'Learning English for career advancement', 'B1', 450, 25);
```

### Content Queries

#### Create a Sample Post
```sql
INSERT INTO posts (id, author_id, title, content, level_id, skills, status, published_at) 
VALUES (
  'post-001', 
  'teacher-001', 
  'Common English Phrasal Verbs',
  'In this lesson, we will learn about the most common phrasal verbs used in everyday English conversation...',
  'B1',
  '["vocab", "grammar"]',
  'published',
  NOW()
);
```

#### Get Posts by Level
```sql
SELECT p.title, p.content, u.email as author, pr.display_name, p.created_at
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN profiles pr ON u.id = pr.user_id
WHERE p.level_id = 'B1' AND p.status = 'published'
ORDER BY p.hot_score DESC, p.created_at DESC;
```

#### Get User's Posts with Stats
```sql
SELECT 
  p.title,
  p.upvotes,
  p.downvotes,
  p.comments_count,
  p.hot_score,
  p.created_at
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE u.email = 'teacher@example.com'
ORDER BY p.created_at DESC;
```

### Social Features

#### Get Comments for a Post
```sql
SELECT 
  c.content,
  pr.display_name,
  c.upvotes,
  c.downvotes,
  c.created_at,
  c.parent_id
FROM comments c
JOIN users u ON c.author_id = u.id
JOIN profiles pr ON u.id = pr.user_id
WHERE c.post_id = 'post-001' AND c.status = 'visible'
ORDER BY c.created_at ASC;
```

#### Get User's Badges
```sql
SELECT 
  b.name,
  b.description,
  ub.earned_at
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
JOIN users u ON ub.user_id = u.id
WHERE u.email = 'student@example.com'
ORDER BY ub.earned_at DESC;
```

### Learning Analytics

#### Get Quiz Performance
```sql
SELECT 
  a.type,
  qs.score,
  qs.created_at,
  p.title as related_post
FROM quiz_submissions qs
JOIN artifacts a ON qs.artifact_id = a.id
LEFT JOIN posts p ON a.post_id = p.id
JOIN users u ON qs.user_id = u.id
WHERE u.email = 'student@example.com'
ORDER BY qs.created_at DESC;
```

#### Get User Progress by Skill
```sql
SELECT 
  JSON_UNQUOTE(JSON_EXTRACT(p.skills, '$[0]')) as skill,
  COUNT(*) as posts_read,
  AVG(qs.score) as avg_quiz_score
FROM posts p
JOIN artifacts a ON p.id = a.post_id
JOIN quiz_submissions qs ON a.id = qs.artifact_id
JOIN users u ON qs.user_id = u.id
WHERE u.email = 'student@example.com'
GROUP BY skill;
```

### Moderation Queries

#### Get Pending Moderation Items
```sql
SELECT 
  mq.target_type,
  mq.target_id,
  mq.source,
  mq.created_at,
  JSON_UNQUOTE(JSON_EXTRACT(mq.payload, '$.reason')) as reason
FROM moderation_queue mq
WHERE mq.status = 'pending'
ORDER BY mq.created_at ASC;
```

#### Get Reports Summary
```sql
SELECT 
  r.target_type,
  COUNT(*) as report_count,
  r.target_id
FROM reports r
GROUP BY r.target_type, r.target_id
HAVING COUNT(*) > 1
ORDER BY report_count DESC;
```

### Performance Queries

#### Get Hot Posts
```sql
SELECT 
  p.title,
  p.hot_score,
  p.upvotes,
  p.downvotes,
  p.comments_count,
  pr.display_name as author
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN profiles pr ON u.id = pr.user_id
WHERE p.status = 'published'
ORDER BY p.hot_score DESC
LIMIT 10;
```

#### Get Active Users
```sql
SELECT 
  pr.display_name,
  pr.points,
  pr.reputation,
  COUNT(p.id) as total_posts,
  COUNT(c.id) as total_comments
FROM profiles pr
JOIN users u ON pr.user_id = u.id
LEFT JOIN posts p ON u.id = p.author_id
LEFT JOIN comments c ON u.id = c.author_id
GROUP BY pr.user_id
ORDER BY pr.points DESC
LIMIT 20;
```

### Cleanup Queries

#### Delete Test Data
```sql
DELETE FROM user_badges WHERE user_id IN ('teacher-001', 'student-001');
DELETE FROM profiles WHERE user_id IN ('teacher-001', 'student-001');
DELETE FROM posts WHERE author_id IN ('teacher-001', 'student-001');
DELETE FROM users WHERE id IN ('teacher-001', 'student-001');
```

#### Reset Auto-increment (if needed)
```sql
ALTER TABLE posts AUTO_INCREMENT = 1;
ALTER TABLE comments AUTO_INCREMENT = 1;
```

### Backup Commands

#### Export Schema
```bash
mysqldump -u nestjs_user -p --no-data education_platform > schema_backup.sql
```

#### Export Data
```bash
mysqldump -u nestjs_user -p education_platform > full_backup.sql
```

#### Import Database
```bash
mysql -u nestjs_user -p education_platform < backup.sql
```

### Optimization Queries

#### Check Index Usage
```sql
SHOW INDEX FROM posts;
SHOW INDEX FROM comments;
SHOW INDEX FROM users;
```

#### Analyze Table Statistics
```sql
ANALYZE TABLE posts;
ANALYZE TABLE comments;
ANALYZE TABLE users;
```

#### Check Table Sizes
```sql
SELECT 
  table_name,
  round(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'education_platform'
ORDER BY size_mb DESC;
```
