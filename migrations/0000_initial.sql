DO $$ 
BEGIN
	-- Create tables if they don't exist
	CREATE TABLE IF NOT EXISTS universities (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		website TEXT NOT NULL,
		country TEXT NOT NULL,
		last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		summary TEXT
	);

	CREATE TABLE IF NOT EXISTS policies (
		id SERIAL PRIMARY KEY,
		university_id INTEGER REFERENCES universities(id) NOT NULL,
		category TEXT NOT NULL,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		status TEXT NOT NULL,
		implementation_date TIMESTAMP,
		last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS sources (
		id SERIAL PRIMARY KEY,
		university_id INTEGER REFERENCES universities(id) NOT NULL,
		policy_id INTEGER REFERENCES policies(id),
		url TEXT NOT NULL,
		title TEXT NOT NULL,
		type TEXT NOT NULL,
		retrieval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		content TEXT,
		metadata JSONB
	);

	RAISE NOTICE 'Database schema created successfully';
EXCEPTION
	WHEN others THEN
		RAISE NOTICE 'Error creating schema: %', SQLERRM;
		RAISE;
END $$;