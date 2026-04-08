from flask import Flask, request, send_file
import pdfplumber
import pandas as pd
import io

app = Flask(__name__)

@app.route('/api/convert', methods=['POST'])
def convert_pdf():
    # 1. Check karna ki file aayi hai ya nahi
    if 'file' not in request.files:
        return {"error": "Bhai, file nahi aayi!"}, 400
    
    file = request.files['file']
    format_type = request.form.get('format', 'xlsx') # Check format (xlsx ya csv)
    
    try:
        all_tables_data = []
        
        # 2. pdfplumber se file padhna (Lines/Borders mode)
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables({
                    "vertical_strategy": "lines", 
                    "horizontal_strategy": "lines"
                })
                for table in tables:
                    all_tables_data.extend(table)
                    
        if not all_tables_data:
            return {"error": "PDF me koi perfect table nahi mili!"}, 400
            
        # 3. Data ko Pandas (Excel Manager) me daalna
        df = pd.DataFrame(all_tables_data)
        output_buffer = io.BytesIO()
        
        # 4. Format ke hisaab se file taiyar karna
        if format_type == 'xlsx':
            df.to_excel(output_buffer, index=False, header=False)
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = 'converted_file.xlsx'
        else:
            df.to_csv(output_buffer, index=False, header=False)
            mimetype = 'text/csv'
            filename = 'converted_file.csv'
            
        output_buffer.seek(0) 
        
        # 5. File wapas TSX (Frontend) ko bhej dena
        return send_file(
            output_buffer,
            download_name=filename,
            as_attachment=True,
            mimetype=mimetype
        )
        
    except Exception as e:
        return {"error": str(e)}, 500
