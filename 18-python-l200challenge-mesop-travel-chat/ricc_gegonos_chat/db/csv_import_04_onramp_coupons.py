
import uuid
import csv
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

VERSION='0.3'
# Define the SQLite database file
db_file = f'gegonos-v{VERSION}.sqlite3'
print(f"db_file: {db_file}")

# Create an SQLAlchemy engine to connect to the database
engine = create_engine(f'sqlite:///{db_file}')

# Define the base for declarative models
Base = declarative_base()

# Define the OnRamp class that maps to the database table
class OnRamp(Base):
    __tablename__ = 'onramp'

    # Define the table columns based on your CSV data
    custom_id = Column(String, primary_key=True)  # Set cid as the primary key
    account_id = Column(String)
    is_expired = Column(Boolean)
    is_usable = Column(Boolean)
    is_ft_credit = Column(Boolean)
    campaign_id = Column(Integer)
    coupon_code = Column(String)
    coupon_code_4x4 = Column(String)
    requester_email = Column(String)
    credit_amount_currency_code = Column(String)
    credit_amount_usd = Column(Float)
    applied_amount_usd = Column(Float)
    remaining_amount_usd = Column(Float)
    daily_consumption_amount_usd = Column(Float)
    valid_start_yyyymm = Column(String)
    valid_start_yyyymmdd = Column(String)
    promotion_name = Column(String)
    valid_start_date = Column(Float)  # Assuming these are timestamps
    valid_end_date = Column(Float)  # Assuming these are timestamps
    credit_creation_date_yyyymmdd = Column(String)
    creation_date = Column(Float)  # Assuming this is a timestamp
    is_onramp = Column(Boolean)
    account_id_hash = Column(String)
    application_type = Column(String)
    recurrence = Column(String)
    incentive_id = Column(Integer)
    table_env = Column(String)
    table_version = Column(Float)
    table_freshness = Column(Integer)
    some_consumption = Column(Boolean)
    cid = Column(String)
    amount_usd = Column(Float)
    event_start_ts = Column(String)
    redemption_window_days = Column(Integer)
    link = Column(String)
    redemption_window_end = Column(String)
    coupon_length_days = Column(Integer)
    attendee = Column(String)
    assigned_ts = Column(String)
    access_click_ts = Column(String)
    eid = Column(String)
    date_start = Column(String)
    event_id = Column(String)
    organizer = Column(String)
    event_name = Column(String)
    sheetless_url = Column(String)
    sheetless_fancy_url = Column(String)
    date_end = Column(String)
    cta_url = Column(String)
    cta_fancy_url = Column(String)
    is_test_event = Column(Boolean)
    seems_like_a_test_event = Column(String)
    events_table_freshness = Column(Integer)
    now_minus_events_table_freshness = Column(Integer)
    now_minus_credits_table_freshness = Column(Integer)
    event_fancy_url = Column(String)
    event_start_date = Column(String)
    event_end_date = Column(String)
    credit_date = Column(String)
    credit_date_month = Column(String)
    is_allocated = Column(Boolean)
    is_assigned = Column(Boolean)
    is_activated = Column(Boolean)
    has_remaining_amount = Column(Boolean)


# Create the table in the database
Base.metadata.create_all(engine)

# Create a session to interact with the database
Session = sessionmaker(bind=engine)
session = Session()

# Open the CSV file
# with open('private/04-onramp-events-USELESS.csv', 'r') as file:
#     # Create a CSV reader object
#     reader = csv.DictReader(file)

#     # Iterate over the rows in the CSV file
#     for row in reader:
#         # Create a new OnRamp object for each row
#         onramp_entry = OnRamp(**row)

#         # Add the object to the session
#         session.add(onramp_entry)
# Open the CSV file
with open('private/04-onramp-events-USELESS.csv', 'r') as file:
    # Create a CSV reader object
    reader = csv.DictReader(file)

    # Iterate over the rows in the CSV file
    ix =0
    for row in reader:
#        print("")
        row['custom_id'] = str(uuid.uuid4())
        # Convert 'TRUE' and 'FALSE' strings to boolean values for all columns
        for key, value in row.items():
            if value == 'TRUE':
                row[key] = 1
            elif value == 'FALSE':
                row[key] = 0
            elif value.lower() == 'null':  # Handle "null", "NULL", etc.
                row[key] = None

        # Create a new OnRamp object for each row
        onramp_entry = OnRamp(**row)

        # Add the object to the session
        session.add(onramp_entry)
        ix += 1
# Commit the changes to the database
session.commit()

# Close the session
session.close()

print(f"[ok] Done! {ix} rows written.")
