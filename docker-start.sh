#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h db -p 5432 -U policytracker; do
	echo "PostgreSQL is unavailable - sleeping"
	sleep 1
done

echo "PostgreSQL is up - executing migrations"
npm run db:push

echo "Starting application"
npm start