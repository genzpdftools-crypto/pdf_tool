from flask import Flask, request, send_file
import pdfplumber
import pandas as pd
import io
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

app = Flask(__name__)

def is_date_serial(text):
    try:
        val = float(text)
        # Check if it looks like an Excel date serial number (between year ~1982 and ~2064)
        if 30000 < val < 60000:
            return True
        return False
    except ValueError:
        return False

def format_excel_date(serial):
    # Pandas can handle Excel serials
    date_val = pd.to_datetime(serial, unit='D', origin='1899-12-30')
    return date_val.strftime('%d-%b')

@app.route('/api/convert', methods=['POST'])
def convert_pdf():
    if 'file' not in request.files:
        return {"error": "Bhai, file nahi aayi!"}, 400
    
    file = request.files['file']
    format_type = request.form.get('format', 'xlsx')
    
    try:
        all_raw_data = []
        
        # 1. Extract data using pdfplumber's table engine
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables({
                    "vertical_strategy": "lines", 
                    "horizontal_strategy": "lines"
                })
                for table in tables:
                    # Clean up the table (remove None values and normalize spaces)
                    cleaned_table = []
                    for row in table:
                        clean_row = []
                        for cell in row:
                            if cell is None:
                                clean_row.append("")
                            else:
                                text = " ".join(cell.split())
                                # Apply the smart date formatter logic
                                if is_date_serial(text):
                                    text = format_excel_date(float(text))
                                clean_row.append(text)
                        cleaned_table.append(clean_row)
                    all_raw_data.extend(cleaned_table)
                    
        if not all_raw_data:
            return {"error": "PDF me koi perfect table nahi mili!"}, 400
            
        output_buffer = io.BytesIO()
        
        if format_type == 'xlsx':
            # --- START OF EXCEL STYLING MAGIC ---
            wb = Workbook()
            ws = wb.active
            ws.title = "Data"
            
            # 1. Gridlines off (White Canvas)
            ws.sheet_view.showGridLines = False
            
            # 2. Add data to worksheet
            for row in all_raw_data:
                ws.append(row)
                
            # 3. Detect Table Boundaries for Borders
            table_start_row = -1
            table_end_row = -1
            
            for row_idx, row_data in enumerate(all_raw_data, start=1):
                row_string = " ".join([str(c).lower() for c in row_data])
                
                if table_start_row == -1 and 'week' in row_string and 'date' in row_string:
                    table_start_row = row_idx
                
                if table_start_row != -1 and row_idx > table_start_row:
                    if 'total' in row_string:
                        table_end_row = row_idx - 1
                        break
                    table_end_row = row_idx

            if table_start_row != -1 and table_end_row == -1:
                 table_end_row = len(all_raw_data)
            
            # Define Borders
            thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
            
            # 4. Apply Styles (Fonts, Alignment, Borders)
            for row_idx in range(1, ws.max_row + 1):
                for col_idx in range(1, ws.max_column + 1):
                    cell = ws.cell(row=row_idx, column=col_idx)
                    text = str(cell.value) if cell.value else ""
                    text_lower = text.lower()
                    
                    is_bold = False
                    # Make Key-value labels and specific elements bold
                    if ":" in text or 'total' in text_lower or 'must be received' in text_lower or 'fall 2003' in text_lower:
                        is_bold = True
                        
                    alignment = Alignment(vertical="center", wrap_text=True, horizontal="left")
                    
                    # Apply Exact Borders inside the table grid
                    is_table_area = (table_start_row != -1) and (table_start_row <= row_idx <= table_end_row) and (col_idx <= 4)
                    
                    if is_table_area:
                        cell.border = thin_border
                        if row_idx == table_start_row:
                            is_bold = True
                            alignment = Alignment(vertical="center", wrap_text=True, horizontal="center")
                        else:
                            if col_idx == 1:
                                alignment = Alignment(vertical="center", wrap_text=True, horizontal="center")
                            elif text != "":
                                alignment = Alignment(vertical="center", wrap_text=True, horizontal="right")
                                
                    cell.font = Font(name="Arial", size=10, bold=is_bold)
                    cell.alignment = alignment
                    cell.fill = PatternFill("solid", fgColor="FFFFFF") # White background
            
            # 5. Set Column Widths
            ws.column_dimensions['A'].width = 15
            ws.column_dimensions['B'].width = 25
            ws.column_dimensions['C'].width = 25
            ws.column_dimensions['D'].width = 15
            
            # 6. Page Setup (A4, Fit to 1 page)
            ws.page_setup.paperSize = ws.PAPERSIZE_A4
            ws.page_setup.orientation = ws.ORIENTATION_PORTRAIT
            ws.page_setup.fitToPage = True
            ws.page_setup.fitToHeight = 1
            ws.page_setup.fitToWidth = 1
            ws.page_margins.left = 0.25
            ws.page_margins.right = 0.25
            ws.page_margins.top = 0.5
            ws.page_margins.bottom = 0.5
            
            # Save to buffer
            wb.save(output_buffer)
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = 'converted_file.xlsx'
            
            # --- END OF STYLING MAGIC ---
            
        else:
            # For CSV, styling doesn't matter, just use pandas
            df = pd.DataFrame(all_raw_data)
            df.to_csv(output_buffer, index=False, header=False)
            mimetype = 'text/csv'
            filename = 'converted_file.csv'
            
        output_buffer.seek(0) 
        
        return send_file(
            output_buffer,
            download_name=filename,
            as_attachment=True,
            mimetype=mimetype
        )
        
    except Exception as e:
        print(f"Error in convert.py: {str(e)}") # Log for debugging
        return {"error": str(e)}, 500
