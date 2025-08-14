-- Grant additional privileges to nestjs_user for migrations
GRANT CREATE ON *.* TO 'nestjs_user'@'%';
GRANT DROP ON *.* TO 'nestjs_user'@'%';
FLUSH PRIVILEGES;
