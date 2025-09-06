from db import get_connection

# Connect to the database
conn = get_connection()
cursor = conn.cursor()

# Show tables
cursor.execute("SHOW TABLES;")
print("Tables:", cursor.fetchall())

cursor.close()
conn.close()
