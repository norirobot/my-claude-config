import sqlite3

# Create or connect to database
conn = sqlite3.connect('academy.db')
cursor = conn.cursor()

# Create students table
cursor.execute('''
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    grade TEXT,
    email TEXT UNIQUE,
    enrollment_date DATE DEFAULT CURRENT_DATE
)
''')

# Commit changes and close
conn.commit()
print("Database 'academy.db' created successfully!")
print("Table 'students' created successfully!")

# Show table structure
cursor.execute("PRAGMA table_info(students)")
columns = cursor.fetchall()
print("\nTable structure:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

conn.close()