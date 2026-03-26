/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS feedback (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      rating INTEGER NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  pgm.sql(`
    ALTER TABLE feedback
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'feedback_rating_check'
      ) THEN
        ALTER TABLE feedback
        ADD CONSTRAINT feedback_rating_check
        CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5));
      END IF;
    END
    $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS feedback;');
};