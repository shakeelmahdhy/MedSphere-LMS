from database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
columns = inspector.get_columns('certificates')
for column in columns:
    print(f"Column: {column['name']}")
