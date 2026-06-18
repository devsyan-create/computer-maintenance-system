import openpyxl
from datetime import datetime
import json

def generate_serial_number(index):
    """Generate serial number: AST-YYYYMMDD-XXXX"""
    date = datetime.now()
    year = date.year
    month = str(date.month).zfill(2)
    day = str(date.day).zfill(2)
    number = str(index).zfill(4)
    return f"AST-{year}{month}{day}-{number}"

def clean_value(value):
    """Clean cell values"""
    if value is None or value == '':
        return ''
    if isinstance(value, str):
        if value.startswith('='):
            return ''
        return value.strip()
    return str(value)

def normalize_category(category):
    """Normalize category names"""
    category = category.strip()
    category_map = {
        'all in one': 'All In One',
        'desktop': 'Desktop',
        'laptop': 'Laptop',
        'printer': 'Printer',
        'scanner': 'Scanner',
        'moniter': 'Monitor',
        'monitor': 'Monitor',
        'phone': 'Phone',
        'smart phone': 'Smart Phone',
        'tablet': 'Tablet',
        'card printer': 'Card Printer',
        'flash drive': 'Flash Drive',
    }
    
    # Check if it's a brand name used as category
    brands = ['hp', 'dell', 'lenovo', 'canon', 'epson', 'lg', 'apple', 'asus']
    if category.lower() in brands:
        return 'Desktop'
    
    normalized = category_map.get(category.lower(), category)
    return normalized

# Load workbook
wb = openpyxl.load_workbook('new-db.xlsx')
ws = wb.active

assets = []
categories_set = set()
brands_set = set()
locations_dict = {}  # location_name: asset_count

print("🔄 Processing Excel data...\n")

# Read data starting from row 3
for row_idx, row in enumerate(ws.iter_rows(min_row=3, values_only=True), start=1):
    if not any(row):
        continue
    
    # Column mapping based on Excel structure
    location = clean_value(row[1])  # Column 2: شوێن
    department = clean_value(row[3])  # Column 4: بەش
    category = clean_value(row[5])  # Column 6: جۆری کەرەستە
    brand = clean_value(row[6])  # Column 7: بڕاند
    model = clean_value(row[7])  # Column 8: مۆدێل
    ram = clean_value(row[8])  # Column 9: ڕام
    storage = clean_value(row[9])  # Column 10: هارد
    cpu = clean_value(row[10])  # Column 11: پڕۆسێسەر
    user = clean_value(row[11])  # Column 12: بەکارهێنەر
    serial = clean_value(row[12])  # Column 13: Serial
    phone = clean_value(row[13])  # Column 14: موبایل
    job = clean_value(row[14])  # Column 15: ئیش و کار
    notes = clean_value(row[15])  # Column 16: تێبینی
    
    # Skip if no location or category
    if not location or not category:
        continue
    
    # Normalize category
    category = normalize_category(category)
    
    # Create asset name from category, brand, model
    asset_name_parts = [category]
    if brand:
        asset_name_parts.append(brand)
    if model:
        asset_name_parts.append(model)
    asset_name = ' - '.join(asset_name_parts)
    
    # Count assets per location
    if location not in locations_dict:
        locations_dict[location] = 0
    locations_dict[location] += 1
    
    # Add to sets
    categories_set.add(category)
    if brand:
        brands_set.add(brand)
    
    # Build notes
    notes_parts = []
    if department:
        notes_parts.append(f"بەش: {department}")
    if notes:
        notes_parts.append(notes)
    if phone:
        notes_parts.append(f"موبایل: {phone}")
    if job:
        notes_parts.append(f"کار: {job}")
    
    combined_notes = "\n".join(notes_parts)
    
    # Create asset object
    asset = {
        'name': asset_name,
        'serialNumber': serial if serial else generate_serial_number(row_idx),
        'category': category,
        'brand': brand,
        'model': model,
        'cpu': cpu,
        'ram': ram,
        'storage': storage,
        'macAddress': '',
        'location': location,
        'user': user,
        'status': 'چالاک',
        'notes': combined_notes,
    }
    
    assets.append(asset)

print(f"✅ Processed {len(assets)} assets")
print(f"✅ Found {len(locations_dict)} unique locations")
print(f"✅ Found {len(categories_set)} unique categories")
print(f"✅ Found {len(brands_set)} unique brands\n")

# Create locations with asset count
locations = []
for location_name in sorted(locations_dict.keys()):
    locations.append({
        'name': location_name,
        'assetCount': locations_dict[location_name]
    })

# Save to JSON
with open('assets_final.json', 'w', encoding='utf-8') as f:
    json.dump(assets, f, ensure_ascii=False, indent=2)

with open('locations_final.json', 'w', encoding='utf-8') as f:
    json.dump(locations, f, ensure_ascii=False, indent=2)

with open('categories_final.json', 'w', encoding='utf-8') as f:
    categories = [{'name': cat} for cat in sorted(categories_set)]
    json.dump(categories, f, ensure_ascii=False, indent=2)

with open('brands_final.json', 'w', encoding='utf-8') as f:
    brands = [{'name': brand} for brand in sorted(brands_set)]
    json.dump(brands, f, ensure_ascii=False, indent=2)

print("📁 Files created:")
print(f"  ✓ assets_final.json ({len(assets)} items)")
print(f"  ✓ locations_final.json ({len(locations)} items)")
print(f"  ✓ categories_final.json ({len(categories_set)} items)")
print(f"  ✓ brands_final.json ({len(brands_set)} items)\n")

print("📋 Locations with asset counts:")
for loc in locations:
    print(f"  • {loc['name']}: {loc['assetCount']} کەرەستە")

print("\n📄 Sample asset:")
if assets:
    print(json.dumps(assets[0], ensure_ascii=False, indent=2))
