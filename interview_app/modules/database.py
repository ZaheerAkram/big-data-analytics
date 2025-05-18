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
                
class JobPositionDB:
    @staticmethod
    def create_table():
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            # Check if job_positions table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'job_positions'
                );
            """)
            table_exists = cursor.fetchone()[0]

            if not table_exists:
                cursor.execute("""
                    CREATE TABLE job_positions (
                        job_id SERIAL PRIMARY KEY,
                        title VARCHAR(100) NOT NULL,
                        department VARCHAR(100),
                        difficulty_level VARCHAR(50)
                    );
                """)
                conn.commit()
                print("Job Positions table created successfully!")
            else:
                print("Job Positions table already exists.")

        except Exception as e:
            print(f"Error creating job_positions table: {e}")
            if conn:
                conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def add_job_position(title, department, difficulty_level):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            # Check if the title already exists
            cursor.execute("""
                SELECT job_id FROM job_positions
                WHERE LOWER(title) = LOWER(%s);
            """, (title,))
            existing = cursor.fetchone()

            if existing:
                print(f"Job title '{title}' already exists with ID {existing[0]}. Skipping insert.")
                return None  # Title already exists, don't insert

            # Insert the new job position
            cursor.execute("""
                INSERT INTO job_positions (title, department, difficulty_level)
                VALUES (%s, %s, %s)
                RETURNING job_id;
            """, (title, department, difficulty_level))

            job_id = cursor.fetchone()[0]
            conn.commit()
            return job_id

        except Exception as e:
            print(f"Error adding job position: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)    
   
    @staticmethod
    def get_job_title_by_id(job_id):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT title FROM job_positions
                WHERE job_id = %s;
            """, (job_id,))
            result = cursor.fetchone()
            return result[0] if result else None

        except Exception as e:
            print(f"Error retrieving job title by ID: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def get_all_positions():
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM job_positions;")
            rows = cursor.fetchall()
            return [
                {
                    "job_id": row[0],
                    "title": row[1],
                    "department": row[2],
                    "difficulty_level": row[3]
                }
                for row in rows
            ]

        except Exception as e:
            print(f"Error fetching job positions: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def get_positions_by_title(title):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT * FROM job_positions
                WHERE title = {%S};
            """, (title,))

            rows = cursor.fetchall()
            print(rows)
            return [
                {
                    "job_id": row[0],
                    "title": row[1],
                    "department": row[2],
                    "difficulty_level": row[3]
                }
                for row in rows
            ]

        except Exception as e:
            print(f"Error fetching job positions by department: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def update_job_position(job_id, title=None, department=None, difficulty_level=None):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            update_fields = []
            params = []

            if title:
                update_fields.append("title = %s")
                params.append(title)
            if department:
                update_fields.append("department = %s")
                params.append(department)
            if difficulty_level:
                update_fields.append("difficulty_level = %s")
                params.append(difficulty_level)

            if not update_fields:
                return False  # Nothing to update

            params.append(job_id)

            query = f"""
                UPDATE job_positions
                SET {', '.join(update_fields)}
                WHERE job_id = %s;
            """
            cursor.execute(query, tuple(params))
            conn.commit()
            return cursor.rowcount > 0

        except Exception as e:
            print(f"Error updating job position: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

    @staticmethod
    def delete_job_position(job_id):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                DELETE FROM job_positions
                WHERE job_id = %s;
            """, (job_id,))
            conn.commit()
            return cursor.rowcount > 0

        except Exception as e:
            print(f"Error deleting job position: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)
                             
    @staticmethod
    def get_job_id_by_title(title):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT job_id FROM job_positions
                WHERE LOWER(title) = LOWER(%s);
            """, (title,))
            
            result = cursor.fetchone()
            if result:
                return result[0]  # job_id
            return None  # Not found

        except Exception as e:
            print(f"Error fetching job ID by title: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

class UserJobApplicationDB:
    @staticmethod
    def create_user_applications_table():
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'user_applications'
                );
            """)
            exists = cursor.fetchone()[0]

            if not exists:
                cursor.execute("""
                    CREATE TABLE user_applications (
                        application_id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        job_id INTEGER NOT NULL REFERENCES job_positions(job_id) ON DELETE CASCADE,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(user_id, job_id)
                    );
                """)
                conn.commit()
                print("user_applications table created successfully!")
            else:
                print("user_applications table already exists.")
        except Exception as e:
            print(f"Error creating user_applications table: {e}")
            if conn:
                conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)


    @staticmethod
    def apply_for_job(user_id, job_id):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            # Check if this application already exists
            cursor.execute("""
                SELECT application_id FROM user_applications
                WHERE user_id = %s AND job_id = %s;
            """, (user_id, job_id))
            if cursor.fetchone():
                print("User already applied for this job.")
                return None

            # Insert new application
            cursor.execute("""
                INSERT INTO user_applications (user_id, job_id)
                VALUES (%s, %s)
                RETURNING application_id;
            """, (user_id, job_id))

            app_id = cursor.fetchone()[0]
            conn.commit()
            return app_id

        except Exception as e:
            print(f"Error applying for job: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)


class InterviewStatusDB:
    @staticmethod
    def create_interview_status_table():
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            # Check if interview_status table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'interview_status'
                );
            """)
            exists = cursor.fetchone()[0]

            if not exists:
                cursor.execute("""
                    CREATE TABLE interview_status (
                        interview_id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        job_id INTEGER NOT NULL REFERENCES job_positions(job_id) ON DELETE CASCADE,
                        score NUMERIC,
                        completed BOOLEAN DEFAULT FALSE,
                        UNIQUE(user_id, job_id)
                    );
                """)
                conn.commit()
                print("interview_status table created successfully!")
            else:
                print("interview_status table already exists.")
        except Exception as e:
            print(f"Error creating interview_status table: {e}")
            if conn:
                conn.rollback()
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)
    
    @staticmethod
    def set_interview_status(user_id, job_id, score=None, completed=False):
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            # Check if record exists
            cursor.execute("""
                SELECT interview_id FROM interview_status
                WHERE user_id = %s AND job_id = %s;
            """, (user_id, job_id))
            existing = cursor.fetchone()

            if existing:
                # Update existing record
                cursor.execute("""
                    UPDATE interview_status
                    SET score = %s, completed = %s
                    WHERE interview_id = %s;
                """, (score, completed, existing[0]))
                conn.commit()
                return existing[0]
            else:
                # Insert new record
                cursor.execute("""
                    INSERT INTO interview_status (user_id, job_id, score, completed)
                    VALUES (%s, %s, %s, %s)
                    RETURNING interview_id;
                """, (user_id, job_id, score, completed))
                interview_id = cursor.fetchone()[0]
                conn.commit()
                return interview_id
        except Exception as e:
            print(f"Error setting interview status: {e}")
            if conn:
                conn.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)
    
    @staticmethod
    def get_all_interview_statuses():
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM interview_status;")
            rows = cursor.fetchall()
            return rows

        except Exception as e:
            print(f"Error retrieving interview statuses: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if conn:
                DatabaseConnection.return_connection(conn)

