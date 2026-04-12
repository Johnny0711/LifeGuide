-- LifeGuide Database Schema for PostgreSQL
-- This file contains the schema definitions based on the JPA @Entity models.

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    needs_setup BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    username VARCHAR(255) UNIQUE,
    age INTEGER,
    height_cm DOUBLE PRECISION,
    current_weight_kg DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY,
    text VARCHAR(255),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    user_id UUID NOT NULL,
    CONSTRAINT fk_todo_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    icon VARCHAR(255),
    color VARCHAR(255),
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    user_id UUID NOT NULL,
    CONSTRAINT fk_habit_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS habit_completions (
    habit_id UUID NOT NULL,
    completion_date DATE,
    CONSTRAINT fk_habit_completion_habit FOREIGN KEY (habit_id) REFERENCES habits (id)
);

CREATE TABLE IF NOT EXISTS pins (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    color VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    user_id UUID NOT NULL,
    CONSTRAINT fk_pin_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS workout_splits (
    id UUID PRIMARY KEY,
    workout_day VARCHAR(255),
    split_name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    user_id UUID NOT NULL,
    CONSTRAINT fk_workout_split_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    workout_split_id UUID NOT NULL,
    CONSTRAINT fk_exercise_workout_split FOREIGN KEY (workout_split_id) REFERENCES workout_splits (id)
);

CREATE TABLE IF NOT EXISTS fitness_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_fitness_log_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE,
    owner_id UUID NOT NULL,
    CONSTRAINT fk_shopping_list_owner FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS shopping_list_items (
    id UUID PRIMARY KEY,
    text VARCHAR(255),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    shopping_list_id UUID NOT NULL,
    CONSTRAINT fk_shopping_list_item_list FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shopping_list_shares (
    shopping_list_id UUID NOT NULL,
    user_id UUID NOT NULL,
    PRIMARY KEY (shopping_list_id, user_id),
    CONSTRAINT fk_share_list FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE,
    CONSTRAINT fk_share_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS shopping_list_invites (
    id UUID PRIMARY KEY,
    shopping_list_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_invite_list FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE,
    CONSTRAINT fk_invite_sender FOREIGN KEY (sender_id) REFERENCES users (id),
    CONSTRAINT fk_invite_recipient FOREIGN KEY (recipient_id) REFERENCES users (id)
);
