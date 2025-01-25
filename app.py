from flask import Flask, request, jsonify, render_template
import pandas as pd

app = Flask(__name__)

# Load materials data from Excel
file_path = "Materials Estimator.xlsx"
xls = pd.ExcelFile(file_path)
df = xls.parse(sheet_name="Sheet1")

df = df.dropna(how='all').dropna(axis=1, how='all')
df.columns = ["Material", "Quantity", "Unit", "Extra"]
df = df[["Material", "Quantity", "Unit"]]
df = df.dropna(subset=["Material", "Quantity", "Unit"])
df["Quantity"] = pd.to_numeric(df["Quantity"], errors='coerce')
df = df.dropna()
df["Material"] = df["Material"].str.strip()

# Standard block area from dataset
block_area_standard = 50000

# Calculate per-square-meter ratios
df_filtered = df[df["Material"] != "Block Square meter"].copy()
df_filtered["Quantity per sqm"] = df_filtered["Quantity"] / block_area_standard

# Convert to dictionary for quick lookup
material_ratios = df_filtered.set_index("Material")["Quantity per sqm"].to_dict()
unit_mapping = df_filtered.set_index("Material")["Unit"].to_dict()

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/estimate', methods=['POST'])
def estimate_materials():
    data = request.json
    block_size_sqm = float(data.get("block_size_sqm", 0))
    
    if block_size_sqm <= 0:
        return jsonify({"error": "Invalid block size"}), 400
    
    estimated_materials = {}
    for material, ratio in material_ratios.items():
        estimated_value = ratio * block_size_sqm
        
        # Round to whole numbers for pieces (pcs)
        if "pcs" in unit_mapping[material].lower():
            estimated_value = round(estimated_value)
        else:
            estimated_value = round(estimated_value, 2)
        
        estimated_materials[material] = {"quantity": estimated_value, "unit": unit_mapping[material]}
    
    return jsonify(estimated_materials)

if __name__ == '__main__':
    app.run(debug=True)
