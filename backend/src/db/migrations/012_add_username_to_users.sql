-- Add username column (nullable first, so we can backfill existing rows)
ALTER TABLE users ADD COLUMN username VARCHAR(30);

-- Backfill: derive a slug from existing name, de-duplicate using ROW_NUMBER()
-- so two users named "Aniket" don't collide.
WITH numbered AS (
  SELECT
    id,
    LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g')) AS base,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
      ORDER BY created_at
    ) AS rn
  FROM users
)
UPDATE users u
SET username = CASE
  WHEN n.rn = 1 THEN LEFT(n.base, 30)
  ELSE LEFT(n.base, 24) || n.rn::text  -- leave room for suffix within 30 chars
END
FROM numbered n
WHERE u.id = n.id;

-- Now enforce NOT NULL + UNIQUE (safe, since every row has a value)
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Case-insensitive uniqueness/search support
CREATE INDEX idx_users_username_lower ON users(LOWER(username));