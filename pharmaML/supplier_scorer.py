import json
import pandas as pd

with open('state/demand.json', 'r') as file:
    product_demand = json.load(file)

demand_list = list(product_demand.values())
demand_score_list = [x / sum(demand_list) for x in demand_list]

order_data = pd.read_csv('Data/orders.csv')

order_data_relv = order_data[['product_id', 'supplier_id','claimed_lead_time','actual_lead_time','quantity','total_cost']]
order_data_relv['del_lead'] = order_data_relv['actual_lead_time'] - order_data_relv['claimed_lead_time']
order_data_relv['cost'] = order_data_relv['total_cost']/order_data_relv['quantity']

order_data_relv = order_data_relv[['product_id','supplier_id','actual_lead_time', 'del_lead','cost']]
order_data_relv.loc[:, 'del_lead'] = order_data_relv['del_lead'].apply(lambda x: max(0, x))

order_data_relv['del_lead_score'] = 1/(order_data_relv['del_lead']+1)
order_data_relv['cost_score'] = 1/(order_data_relv['cost'])
order_data_relv['actual_lead_time_score'] = 1/(order_data_relv['actual_lead_time']+1)

def calculate_score(demand_score:float, del_lead_score:float, cost_score:float, actual_lead_score:float) -> float:
    return (demand_score*actual_lead_score + (1-demand_score)*cost_score + del_lead_score)

def give_supplier_score(demand:list = demand_score_list, order = order_data_relv.sort_values(by=['product_id','supplier_id'])):
    supplier_scores = {}
    for product_id in order_data_relv['product_id'].unique():
        product_id = int(product_id)  # Convert to Python int
        deman_score = demand[product_id-1]
        supplier_scores[product_id] = {}
        product_data = order_data_relv[order_data_relv['product_id'] == product_id]
        for supplier_id in product_data['supplier_id'].unique():
            supplier_id = int(supplier_id)  # Convert to Python int
            supplier_data = product_data[product_data['supplier_id'] == supplier_id]
            cost_score_sum = supplier_data['cost_score'].sum()
            del_lead_score_sum = supplier_data['del_lead_score'].sum()
            actual_lead_score = supplier_data['actual_lead_time_score'].sum()

            supplier_scores[product_id][supplier_id] = calculate_score(deman_score, del_lead_score_sum, cost_score_sum, actual_lead_score)

    with open('state/supplier_score.json', 'w') as f:
        json.dump(supplier_scores, f, indent=2)
    
give_supplier_score()