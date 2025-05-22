import pandas as pd
from datetime import datetime
import numpy as np

sales_data = pd.read_csv('Data/sales.csv')

sales_data_final = sales_data[['product_id','quantity_sold','sale_date']]

aggregated_df = sales_data_final.groupby(['product_id', 'sale_date']).agg({'quantity_sold': 'sum'}).reset_index()

aggregated_df['sale_date'] = pd.to_datetime(aggregated_df['sale_date'])
aggregated_df['week'] = aggregated_df['sale_date'].dt.isocalendar().week

weekly_aggregated_df = aggregated_df.groupby(['product_id', 'week']).agg({'quantity_sold': 'sum'}).reset_index()

# Step 1: Filter weeks between 0 and 18
weekly_aggregated_df = weekly_aggregated_df[(weekly_aggregated_df['week'] >= 0) & (weekly_aggregated_df['week'] <= 18)]

# Step 2: Create a complete DataFrame of all combinations of product_id and week
all_weeks = pd.DataFrame({'week': np.arange(1, 19)})
products = weekly_aggregated_df['product_id'].unique()

# Create a cartesian product of product_ids and weeks
full_index = pd.MultiIndex.from_product([products, all_weeks['week']], names=['product_id', 'week'])

# Step 3: Reindex the original DataFrame to include missing weeks
weekly_aggregated_df_full = weekly_aggregated_df.set_index(['product_id', 'week']).reindex(full_index).reset_index()

# Step 4: Fill missing values with the mean of previous and next weeks
def fill_missing_weeks(group):
    # Check if 'quantity_sold' is NaN, then interpolate only those missing values
    group['quantity_sold'] = group['quantity_sold'].interpolate(method='linear', limit_direction='both')
    
    # For any remaining NaN (such as those at the start or end), fill forward and backward
    group['quantity_sold'] = group['quantity_sold'].ffill().bfill()
    
    return group

# Apply the function to fill missing data for each product_id
weekly_aggregated_df_full = weekly_aggregated_df_full.groupby('product_id').apply(fill_missing_weeks).reset_index(drop=True)


with open('Data/weekly_aggregated_df_full.csv', 'w') as file:
    weekly_aggregated_df_full.to_csv(file, index=False)