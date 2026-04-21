package com.lifeguide.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs safe idempotent database migrations on startup.
 * These handle schema changes that Hibernate's ddl-auto=update cannot safely perform
 * on existing databases with data (e.g. adding NOT NULL columns to populated tables).
 */
@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        logger.info("Running database migrations...");
        addSortOrderToExercises();
        logger.info("Database migrations complete.");
    }

    /**
     * Adds sort_order column to exercises table if it doesn't exist.
     * This was added in a later version and existing DBs might be missing it.
     * A missing sort_order column causes a 403 on /api/workouts.
     */
    private void addSortOrderToExercises() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_name = 'exercises' AND column_name = 'sort_order'",
                Integer.class
            );
            if (count != null && count == 0) {
                logger.info("Migration: adding sort_order column to exercises table...");
                jdbcTemplate.execute(
                    "ALTER TABLE exercises ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0"
                );
                logger.info("Migration: sort_order column added successfully.");
            } else {
                logger.info("Migration: sort_order column already exists, skipping.");
            }
        } catch (Exception e) {
            logger.error("Migration failed for sort_order column: {}", e.getMessage(), e);
        }
    }
}
