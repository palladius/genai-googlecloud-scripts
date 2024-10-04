import csv
import uuid
from datetime import datetime

from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, Date
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

VERSION='0.4'
# Define the SQLite database file
db_file = f'gegonos-v{VERSION}.sqlite3'
print(f"db_file: {db_file}")

# Create an SQLAlchemy engine to connect to the database
engine = create_engine(f'sqlite:///{db_file}')

# Define the base for declarative models
Base = declarative_base()

# Define the TaskFlow class that maps to the database table
class TaskFlow(Base):
    __tablename__ = 'taskflow'

    cid = Column(String, primary_key=True)  # Set cid as the primary key
    Title = Column(String)
    DeliverableType = Column(String)
    Owners = Column(String)
    FlywheelStage = Column(String)
    DeliverableLink = Column(String)
    EndDate = Column(Date)
    ProductArea = Column(String)
    OSETeam = Column(String)
    TicketLink = Column(String)

# Drop the table if it exists
Base.metadata.drop_all(engine)

# Create the table in the database
Base.metadata.create_all(engine)

# Create a session to interact with the database
Session = sessionmaker(bind=engine)
session = Session()

# Open the CSV file
with open('private/02-taskflow.csv', 'r') as file:
    # Create a CSV reader object
    reader = csv.DictReader(file)

    ix = 0
    # Iterate over the rows in the CSV file
    for row in reader:
        # Generate a UUID for cid
        row['cid'] = str(uuid.uuid4())

          # Convert EndDate to a datetime object
        if row['EndDate']:
            try:
                row['EndDate'] = datetime.strptime(row['EndDate'], '%Y-%m-%d').date()
            except ValueError:
                # Handle invalid date formats (e.g., skip the row, log an error, etc.)
                print(f"Invalid date format in row: {row}")
                continue  # Skip the row if the date format is invalid


        # Create a new TaskFlow object for each row
        taskflow_entry = TaskFlow(**row)

        # Add the object to the session
        session.add(taskflow_entry)
        ix += 1

# Commit the changes to the database
session.commit()

# Close the session
session.close()

print(f"[ok] Done! {ix} rows written.")
