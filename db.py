import mysql.connector

def get_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="2003",  # 👈 Replace with your MySQL root password
            database="attendance_system"
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None


