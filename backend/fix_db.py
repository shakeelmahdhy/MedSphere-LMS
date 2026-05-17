import sqlite3
import os
import bcrypt

def get_password_hash(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

db_path = 'elearning.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    new_hash = get_password_hash('admin123')
    cursor.execute("UPDATE users SET password_hash=?, role='admin' WHERE email='ram@gmail.com'", (new_hash,))
    conn.commit()
    print(f"Updated {cursor.rowcount} rows. Password reset to: admin123")
    conn.close()
else:
    print(f"Database {db_path} not found")
