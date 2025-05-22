import json
import pickle
import numpy as np

model_path = 'models/'

# Dictionary to store demand predictions
def predict_demand(input_week:int):
    demand = {}

    for product_id in range(1, 31):
        input_data = np.array([[input_week]])
        model_i_path = model_path + f'product_{product_id}_ann_model.pkl'

        with open(model_i_path, 'rb') as model_file:
            model = pickle.load(model_file)

        # Perform prediction and convert ndarray to a list
        prediction = model.predict(input_data)
        demand[str(product_id)] = int(prediction.reshape(-1))  # Convert ndarray to list

    return demand




if __name__ == "__main__":
    demand = predict_demand(10)
    # Save the predictions to a JSON file
    with open('state/demand.json', 'w') as file:
        json.dump(demand, file, indent=2)
