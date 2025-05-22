from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
import json
from typing import Dict
from dotenv import load_dotenv
from demand_predictor import predict_demand
from typing import Union
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from rop import reorderPoint

load_dotenv(override=True)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins= ['*'],
)

# Load supplier scores from a JSON file
def load_supplier_scores(file_path: str) -> Dict[str, float]:
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
        #formating of data
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Supplier scores file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding JSON file")

# Route to fetch supplier score
@app.get("/supplier-score", response_class=JSONResponse)
async def get_supplier_score():
    scores = load_supplier_scores("state/supplier_score.json")
    if scores is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return  scores



# Route to fetch product demand for the current week
@app.get("/product-demand", response_class=JSONResponse)
async def get_product_demand(week: Union[int, None] = Query(None, ge=1, le=19)):
    #le value can take max 52 if we have trained on 52 week data. Now we have trained on 18 weeks
    try:
        if week==None:
            # current_day = datetime.now().isocalender()[1]

            # with open('state/update_state.json', 'r') as file:
            #     last_date = json.load(file)
            # last_date = datetime.strptime(last_date, "%Y-%m-%d %H:%M:%S")

            # if(datetime.now().date()>last_date.date()):
            #     return predict_demand(current_day)
            
            with open('state/demand.json', 'r') as file:
                demand = json.load(file)
            
            with open('state/medicine_inventory.json', 'r') as file:
                prod_names = json.load(file)

            if demand is None:
                raise HTTPException(status_code=404, detail="Product not found")
            
            transformed_data = {}
            for product_id, demand_value in demand.items():
                product_name = prod_names.get(product_id, "Unknown Product")
                transformed_data[product_name] = {"demand": demand_value}

            return transformed_data
        else:
            demand = predict_demand(week)
            transformed_data = {}
            with open('state/medicine_inventory.json', 'r') as file:
                prod_names = json.load(file)
                
            for product_id, demand_value in demand.items():
                product_name = prod_names.get(product_id, "Unknown Product")
                transformed_data[product_name] = {"demand": demand_value}

            return transformed_data

    
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Demand file not found")

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Error decoding JSON file")
    


@app.get("/roq", response_class=JSONResponse)
async def reorder_point():
    return reorderPoint()

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return {"message": "Favicon not found. Add a favicon.ico in the static folder."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
