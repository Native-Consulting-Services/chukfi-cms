-- Drop activity_logs table and indexes
DROP INDEX IF EXISTS idx_activity_logs_action;
DROP INDEX IF EXISTS idx_activity_logs_created_at;
DROP INDEX IF EXISTS idx_activity_logs_entity_type;
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP TABLE IF EXISTS activity_logs;
