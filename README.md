# Getting Started

## Data Schema (ER Diagram)
```mermaid
erDiagram
    PRODUCTS {
      SERIAL product_id PK
      VARCHAR product_name
      VARCHAR company_name
      TEXT    formula
      DECIMAL mrp
      DECIMAL cost_price
      INT     tabs_per_strip
      INT     quantity_strips
      INT     total_pills
      DECIMAL discount_percent
      DECIMAL sale_price
    }
    SUPPLIERS {
      SERIAL supplier_id PK
      VARCHAR supplier_name
      INT     lead_time_claimed
      INT     lead_time_actual
      DECIMAL reliability
      VARCHAR contact
    }
    PRODUCTSUPPLIERS {
      SERIAL product_supplier_id PK
      INT    product_id FK
      INT    supplier_id FK
      INT    claimed_lead_time_avg
      INT    actual_lead_time_avg
      DECIMAL cost_price
    }
    SUPPLIERPRODUCTRELIABILITY {
      SERIAL supplier_product_reliability_id PK
      INT    supplier_id FK
      INT    product_id FK
      INT    claimed_lead_time
      INT    actual_lead_time
      DECIMAL reliability_score
    }
    ORDERS {
      SERIAL order_id PK
      DATE   order_date
      INT    product_id FK
      INT    quantity
      INT    supplier_id FK
      DECIMAL total_cost
      VARCHAR status
      INT    claimed_lead_time
      DATE   actual_delivery_date
      INT    actual_lead_time
    }
    INVENTORY {
      SERIAL inventory_id PK
      INT    product_id FK
      INT    quantity
      INT    reorder_level
    }
    SALES {
      SERIAL sale_id PK
      INT    product_id FK
      INT    quantity_sold
      DATE   sale_date
      DECIMAL total_amount
      VARCHAR customer_name
    }
    CUSTOMERREQUESTS {
      SERIAL request_id PK
      VARCHAR customer_name
      INT     product_id FK
      DATE    request_date
      INT     quantity_requested
      VARCHAR status
    }

    PRODUCTS ||--o{ INVENTORY                    : has
    PRODUCTS ||--o{ SALES                        : "is sold in"
    PRODUCTS ||--o{ ORDERS                       : "is ordered in"
    PRODUCTS ||--o{ CUSTOMERREQUESTS             : "is requested in"
    SUPPLIERS ||--o{ ORDERS                       : supplies
    SUPPLIERS ||--o{ PRODUCTSUPPLIERS             : "supply link"
    SUPPLIERS ||--o{ SUPPLIERPRODUCTRELIABILITY   : "reliability link"
    PRODUCTS ||--o{ PRODUCTSUPPLIERS             : "sourced from"
    PRODUCTS ||--o{ SUPPLIERPRODUCTRELIABILITY   : "reliability tracked"
```

## Prerequisites

The following steps require [NodeJS](https://nodejs.org/en/) and [Python](https://www.python.org/) to be installed on your system. Please install them beforehand if you haven't already.

## Steps to Set Up the Project

### Clone the repository:
   ```bash
   git clone https://github.com/shubhanshu1911/Study_Copilot.git
   ```

### Set Up Frontend
1. Install required node modules for frontend
   ```bash
    npm install
   ```
   
2. Run the Backend server
   ```bash
    npm run dev
   ```

### Set Up Main Backend (api folder)
1. Install required node modules for backend
   ```bash
    npm install
   ```
   
2. Run the Backend server
   ```bash
    node server.js
   ```

### Set Up ML backend (pharmaML folder)
1. Install Virtual Environment (if it doesn't already exist):
   ```bash
   python3 -m pip install --user virtualenv
   ```

2. Create a virtual environment:
   ```bash
   python -m venv <environment_name>
   ```

3. Activate the virtual environment:
   ```bash
   source <environment_name>/bin/activate
   ```

4. Install the reqiured packages
    ```bash
    pip install -r requirements.txt
    ```

5. Run the ML server
    ```bash
    python3 main.py
    ```
