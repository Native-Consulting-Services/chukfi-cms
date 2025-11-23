-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";