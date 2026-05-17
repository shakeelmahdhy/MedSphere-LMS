import sqlite3
import os

db_path = 'elearning.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT 0;")
        conn.commit()
        print("Successfully added is_read column to messages table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column is_read already exists.")
        else:
            print(f"Error: {e}")
    conn.close()
else:
    print(f"Database {db_path} not found")
