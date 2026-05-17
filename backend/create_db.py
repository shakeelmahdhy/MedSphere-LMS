import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    # Connect to default postgres database to create a new one
    # If your postgres password is different, please update it here
    try:
        con = psycopg2.connect(
            dbname='postgres', 
            user='postgres', 
            password='postgres', 
            host='localhost'
        )
        
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = con.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'elearning'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute('CREATE DATABASE elearning')
            print("Database 'elearning' created successfully!")
        else:
            print("Database 'elearning' already exists.")
            
        cursor.close()
        con.close()
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
        print("\nPossible issues:")
        print("1. PostgreSQL is not installed.")
        print("2. PostgreSQL service is not running.")
        print("3. The password 'postgres' is incorrect.")

if __name__ == "__main__":
    create_database()
