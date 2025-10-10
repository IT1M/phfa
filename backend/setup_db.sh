#!/bin/bash

# --- Load .env variables ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_PATH="$SCRIPT_DIR/.env"

if [ -f "$ENV_PATH" ]; then
  export $(grep -v '^#' "$ENV_PATH" | xargs)
else
  echo "❌ .env file not found in $SCRIPT_DIR"
  exit 1
fi

# --- Check required vars ---
REQUIRED_VARS=("DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing env variable: $var"
    exit 1
  fi
done

echo "🚀 Starting PostgreSQL service (if installed via Homebrew)..."
brew services start postgresql >/dev/null 2>&1
sleep 2

CURRENT_USER=$(whoami)

# --- Ensure local user DB exists (macOS quirk) ---
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$CURRENT_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$CURRENT_USER'" 2>/dev/null)
if [ "$DB_EXISTS" != "1" ]; then
  echo "⚙️ Creating default DB for local user '$CURRENT_USER'..."
  createdb "$CURRENT_USER" || echo "⚠️ Could not create user default DB (may already exist)."
fi

# --- Role check ---
echo "🧠 Checking if role '$DB_USER' exists..."
USER_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$CURRENT_USER" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null)
if [ "$USER_EXISTS" != "1" ]; then
  echo "⚙️ Creating role '$DB_USER'..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$CURRENT_USER" -c "CREATE ROLE $DB_USER WITH LOGIN SUPERUSER PASSWORD '$DB_PASSWORD';"
else
  echo "✅ Role '$DB_USER' already exists."
fi

# --- DB check ---
echo "🗄️ Checking if database '$DB_NAME' exists..."
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$CURRENT_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)
if [ "$DB_EXISTS" != "1" ]; then
  echo "⚙️ Creating database '$DB_NAME'..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$CURRENT_USER" -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
else
  echo "✅ Database '$DB_NAME' already exists."
fi

# --- Auto-detect schema.sql anywhere in project ---
echo "🔎 Searching for schema.sql in project..."
SCHEMA_PATH=$(find "$SCRIPT_DIR" -type f -name "schema.sql" | head -n 1)

if [ -z "$SCHEMA_PATH" ]; then
  echo "❌ schema.sql not found anywhere under $SCRIPT_DIR"
  exit 1
fi

echo "📦 Applying schema from: $SCHEMA_PATH ..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_PATH" || {
  echo "❌ Failed to apply schema file."
  exit 1
}

# --- Verify result ---
echo "🔍 Listing created tables:"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"

echo "🎉 Done! Database '$DB_NAME' is ready and linked to user '$DB_USER'."
