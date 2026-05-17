import sqlite3
import os

db_path = 'elearning.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Check if domain column exists
        cursor.execute("PRAGMA table_info(certificates)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'domain' not in columns:
            print("Adding 'domain' column to 'certificates' table...")
            cursor.execute("ALTER TABLE certificates ADD COLUMN domain TEXT")
            conn.commit()
            print("Column added successfully.")
        else:
            print("'domain' column already exists.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
else:
    print(f"Database {db_path} not found.")
