SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name IN ('employees', 'roles', 'departments');