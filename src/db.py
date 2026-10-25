
import os
import mysql.connector


def get_connection(database: str = "idop_platform_db"):
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.environ["DB_PASSWORD"],
        database=database,
    )


if __name__ == "__main__":
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE()")
        print("Connected to:", cursor.fetchone()[0])
        cursor.close()
    finally:
        connection.close()
