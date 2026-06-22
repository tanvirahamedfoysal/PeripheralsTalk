CREATE SCHEMA IF NOT EXISTS peripheralstalk;

CREATE TABLE peripheralstalk.images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE peripheralstalk.user_role AS ENUM (
    'ADMIN',
    'EDITOR',
    'USER'
);

CREATE TABLE peripheralstalk.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role peripheralstalk.user_role DEFAULT 'USER',
    image_id INTEGER REFERENCES peripheralstalk.images(id),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TYPE peripheralstalk.editor_application_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE peripheralstalk.editor_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES peripheralstalk.users(id),
    note TEXT,
    status peripheralstalk.editor_application_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE peripheralstalk.peripherals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE peripheralstalk.articles (
    id SERIAL PRIMARY KEY,
    peripheral_id INTEGER REFERENCES peripheralstalk.peripherals(id),
    version_number INTEGER NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES peripheralstalk.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE (peripheral_id, version_number)
);

CREATE TABLE peripheralstalk.bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES peripheralstalk.users(id),
    article_id INTEGER REFERENCES peripheralstalk.articles(id),

    UNIQUE (user_id, article_id)
);

CREATE TABLE peripheralstalk.article_ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES peripheralstalk.users(id),
    article_id INTEGER REFERENCES peripheralstalk.articles(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE (user_id, article_id)
);

CREATE TABLE peripheralstalk.comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES peripheralstalk.articles(id),
    user_id INTEGER REFERENCES peripheralstalk.users(id),
    parent_comment_id INTEGER REFERENCES peripheralstalk.comments(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TYPE peripheralstalk.comment_vote_type AS ENUM (
    'UPVOTE',
    'DOWNVOTE'
);
CREATE TABLE peripheralstalk.comment_votes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES peripheralstalk.comments(id),
    user_id INTEGER REFERENCES peripheralstalk.users(id),
    vote_type peripheralstalk.comment_vote_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (comment_id, user_id)
);

CREATE TYPE peripheralstalk.report_status AS ENUM (
    'PENDING',
    'RESOLVED'
);
CREATE TABLE peripheralstalk.reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES peripheralstalk.users(id),
    reported_user_id INTEGER REFERENCES peripheralstalk.users(id),
    comment_id INTEGER REFERENCES peripheralstalk.comments(id),
    note TEXT,
    status peripheralstalk.report_status DEFAULT 'PENDING',
    reviewed_by INTEGER REFERENCES peripheralstalk.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

CREATE TYPE peripheralstalk.otp_purpose AS ENUM (
    'REGISTER',
    'PASSWORD_RESET'
);

CREATE TABLE peripheralstalk.email_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    purpose peripheralstalk.otp_purpose NOT NULL,
    expires_at TIMESTAMPTZ,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON peripheralstalk.users(email);
CREATE INDEX idx_users_username ON peripheralstalk.users(username);

CREATE INDEX idx_otps_email_purpose ON peripheralstalk.email_otps(email, purpose);

CREATE INDEX idx_comments_article ON peripheralstalk.comments(article_id);
CREATE INDEX idx_ratings_article ON peripheralstalk.article_ratings(article_id);

INSERT INTO peripheralstalk.peripherals (name)
VALUES
    ('Keyboard'),
    ('Mouse'),
    ('Printer'),
    ('Scanner'),
    ('Camera'),
    ('Microphone'),
    ('Projector'),
    ('Speaker'),
    ('External HDD'),
    ('Modem'),
    ('Router'),
    ('Switch'),
    ('USB'),
    ('Game Controller');