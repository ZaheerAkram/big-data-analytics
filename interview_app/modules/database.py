import psycopg2
from psycopg2 import pool
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from config import Config

class DatabaseConnection:
    _connection_pool = None

    @classmethod
    def initialize_pool(cls):
        if cls._connection_pool is None:
            try:
                cls._connection_pool = pool.SimpleConnectionPool(
                    1, 10,
                    dbname=Config.DB_NAME,
                    user=Config.DB_USER,
                    password=Config.DB_PASSWORD,
                    host=Config.DB_HOST,
                    port=Config.DB_PORT
                )
            except Exception as e:
                print(f"Error creating connection pool: {e}")
                raise

    @classmethod
    def get_connection(cls):
        if cls._connection_pool is None:
            cls.initialize_pool()
        return cls._connection_pool.getconn()

    @classmethod
    def return_connection(cls, conn):
        cls._connection_pool.putconn(conn)

    @classmethod
    def close_all_connections(cls):
        if cls._connection_pool is not None:
            cls._connection_pool.closeall()

class UserDB:
    @staticmethod
    def create_tables():
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            
            # Check if users table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                );
            """)
            
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                # Create users table with all required columns
                cursor.execute("""
                    CREATE TABLE users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(100) NOT NULL UNIQUE,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE,
                        role VARCHAR(20) DEFAULT 'user'
                    );
                """)
                conn.commit()
                print("Users table created successfully!")
            else:
                print("Users table already exists.")
            
        except Exception as e:
            print(f"Error creating tables: {e}")
            if conn:
                conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def create_user(username, email, password, first_name=None, last_name=None):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            
            password_hash = generate_password_hash(password)
            
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, first_name, last_name)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id;
            """, (username, email, password_hash, first_name, last_name))
            
            user_id = cursor.fetchone()[0]
            conn.commit()
            return user_id
            
        except Exception as e:
            print(f"Error creating user: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def verify_user(email, password):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, username, password_hash
                FROM users
                WHERE email = %s AND is_active = TRUE;
            """, (email,))
            
            user = cursor.fetchone()
            
            if user and check_password_hash(user[2], password):
                # Update last login
                cursor.execute("""
                    UPDATE users
                    SET last_login = CURRENT_TIMESTAMP
                    WHERE id = %s;
                """, (user[0],))
                conn.commit()
                return {"id": user[0], "username": user[1]}
            return None
            
        except Exception as e:
            print(f"Error verifying user: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def get_user_by_email(email):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, created_at, last_login
                FROM users
                WHERE email = %s;
            """, (email,))
            
            user = cursor.fetchone()
            if user:
                return {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "first_name": user[3],
                    "last_name": user[4],
                    "created_at": user[5],
                    "last_login": user[6]
                }
            return None
            
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn) 