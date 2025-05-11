import psycopg2

# Dummy user data
user_data = {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "hashed_password_123"  # Normally, you'd hash this before storing
}

try:
    # Connect to local PostgreSQL
    conn = psycopg2.connect(
        dbname="Big-Data-Analytics",
        user="postgres",
        password="admin",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    # Create users table if not exists
    create_table_query = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
    """
    cursor.execute(create_table_query)
    conn.commit()

    # Insert dummy user
    insert_query = """
    INSERT INTO users (username, email, password)
    VALUES (%s, %s, %s);
    """
    cursor.execute(insert_query, (user_data["username"], user_data["email"], user_data["password"]))
    conn.commit()

    print("User inserted successfully!")

except Exception as e:
    print("Error:", e)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
