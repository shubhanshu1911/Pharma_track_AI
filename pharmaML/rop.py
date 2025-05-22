import numpy as np
import pandas as pd
import getData
import json


def safety_stock(order_data, sales_data):
    sales_data['sale_date'] = pd.to_datetime(sales_data['sale_date'])

    # Group by product_id and sale_date to calculate total daily quantity sold per product
    daily_sales = sales_data.groupby(['product_id', 'sale_date']).agg({'quantity_sold': 'sum'}).reset_index()

    # Compute the maximum and average daily sales per product
    max_daily_sales = daily_sales.groupby('product_id')['quantity_sold'].max().reset_index(name='max_daily_sales')
    avg_daily_sales = daily_sales.groupby('product_id')['quantity_sold'].mean().reset_index(name='avg_daily_sales')

    # Merge the results
    sales_max_mean = pd.merge(max_daily_sales, avg_daily_sales, on='product_id')

    # Group by product_id and calculate maximum and average lead times
    order_max_mean = order_data.groupby('product_id')['actual_lead_time'].agg(['max', 'mean']).reset_index()

    # Rename the columns for clarity
    order_max_mean.columns = ['product_id', 'max_lead_time', 'avg_lead_time']

    merged_df = pd.merge(sales_max_mean, order_max_mean, on='product_id')

    # Calculate the desired value
    merged_df['safety_stock'] = (merged_df['max_daily_sales'] * merged_df['max_lead_time']) - (merged_df['avg_daily_sales'] * merged_df['avg_lead_time'])

    return merged_df[['product_id', 'safety_stock']]


def reorderPoint():
    order_data = pd.read_csv('Data/orders.csv')
    sales_data = pd.read_csv('Data/sales.csv')

    with open('state/demand.json','r') as file:
        demand = json.load(file)
    
    df = pd.DataFrame(list(demand.items()), columns=['Product_ID', 'Demand'])

    # Convert Product_ID to integer
    df['Product_ID'] = df['Product_ID'].astype(int)

    order_mean_lead = order_data.groupby('product_id')['actual_lead_time'].agg(['mean']).reset_index()

    safe_stock = safety_stock(order_data, sales_data)

    merged_data = df.merge(order_mean_lead, left_on='Product_ID', right_on='product_id', how='left')
    merged_data = merged_data.merge(safe_stock, on='product_id', how='left')

    merged_data['rop'] = (merged_data['Demand'] / 7) * merged_data['mean'] + merged_data['safety_stock']

    final_dict = merged_data.set_index('Product_ID')[['safety_stock', 'rop']].to_dict(orient='index')

    for product_id, values in final_dict.items():
        for key, value in values.items():
            if isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
                values[key] = None  # or a default value like 0
    
    for product_id, values in final_dict.items():
        for key in ['safety_stock', 'rop']:
            value = values[key]
            if value is None:  # Handle None values
                values[key] = None  # Keep it as None or replace with a default value
            else:
                values[key] = int(value)  # Convert to integer
    
    # Convert the dictionary to JSON
    return final_dict

