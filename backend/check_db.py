import sqlite3
import os

db_path = 'elearning.db'
if not os.path.exists(db_path):
    print("Database not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(channel_messages)")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
    conn.close()
