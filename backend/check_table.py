import sqlite3
conn = sqlite3.connect('elearning.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="channel_members"')
print(f"Table exists: {cursor.fetchone()}")
conn.close()
