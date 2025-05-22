from sklearn.model_selection import train_test_split 
import tensorflow as tf
from sklearn.metrics import mean_squared_error


import pickle
import os
import pandas as pd

# Create the directory if it doesn't exist
save_directory = 'models'
if not os.path.exists(save_directory):
    os.makedirs(save_directory)


weekly_aggregated_df_full = pd.read_csv('Data/weekly_aggregated_df_full.csv')

# Prepare the data for training
X = weekly_aggregated_df_full[['product_id', 'week']]
y = weekly_aggregated_df_full['quantity_sold']

# Create a list to store the models for each product
product_models = {}

# Loop through each product and train a separate model
for product_id in range(1, 31):  # Assuming you have products from 1 to 30
    # Filter data for the current product
    product_data = weekly_aggregated_df_full[weekly_aggregated_df_full['product_id'] == product_id]
    X_product = product_data[['week']]
    y_product = product_data['quantity_sold']

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X_product, y_product, test_size=0.2, random_state=42)

    # Artificial Neural Network Regression
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=[1]),  # Input layer with 1 feature (week)
        tf.keras.layers.Dense(32, activation='relu'),  # Hidden layer with 32 neurons and ReLU activation
        tf.keras.layers.Dense(1)  # Output layer with 1 neuron for regression
    ])

    # Compile the model
    model.compile(loss='mse', optimizer='adam')

    # Train the model
    model.fit(X_train, y_train, epochs=100, verbose=0)  # Adjust epochs as needed

    # Evaluate the model
    y_pred = model.predict(X_test)
    rmse = mean_squared_error(y_test, y_pred, squared=False)
    print(f"Product {product_id} - RMSE: {rmse}")


    model_filename = os.path.join(save_directory, f'product_{product_id}_ann_model.pkl')
    with open(model_filename, 'wb') as file:
        pickle.dump(model, file)
