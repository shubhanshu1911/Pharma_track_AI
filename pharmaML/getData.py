import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_user = os.getenv('DB_USER')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
db_password = os.getenv('DB_PASSWORD')
db_port = os.getenv('DB_PORT')

# Connect to the database
try:
    connection = psycopg2.connect(
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port,
        database=db_name
    )
    
    cursor = connection.cursor()
    
    csv_file_path_orders = 'Data/orders.csv'
    csv_file_path_sales = 'Data/sales.csv'
    
    # Use COPY command to export data
    with open(csv_file_path_orders, 'w') as file:
        cursor.copy_expert("COPY orders TO STDOUT WITH CSV HEADER", file)

    with open(csv_file_path_sales, 'w') as file:
        cursor.copy_expert("COPY sales TO STDOUT WITH CSV HEADER", file)

except Exception as error:
    print(f"Error connecting to the database: {error}")
    
finally:
    if connection:
        cursor.close()
        connection.close()
        print("PostgreSQL connection is closed")