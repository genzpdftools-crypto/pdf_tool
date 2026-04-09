from flask import Flask, request, send_file
import pdfplumber
import io
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side
import pandas as pd

app = Flask(__name__)

@app.route('/api/convert', methods=['POST'])
def convert_pdf():
    if 'file' not in request.files:
        return {"error": "File not found"}, 400
    
    file = request.files['file']
    format_type = request.form.get('format', 'xlsx')
    
    try:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Converted PDF"
        ws.sheet_view.showGridLines = False # Clean paper look
        
        thin_border = Border(
            left=Side(style='thin'), right=Side(style='thin'),
            top=Side(style='thin'), bottom=Side(style='thin')
        )

        all_combined_rows = []

        # ==========================================
        # UNIVERSAL DYNAMIC SPATIAL ENGINE
        # ==========================================
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                # Extract har ek word uski exact location aur font style ke sath
                words = page.extract_words(extra_attrs=["fontname", "size"])

                if not words:
                    continue

                raw_items = []
                for w in words:
                    text = w['text'].strip()
                    if not text: continue
                    
                    # Dynamic Bold Detection
                    fontname = w.get('fontname', '').lower()
                    is_bold = 'bold' in fontname or 'black' in fontname
                    
                    raw_items.append({
                        'text': text,
                        'x0': w['x0'],
                        'x1': w['x1'],
                        'top': w['top'],
                        'is_bold': is_bold
                    })

                # Y-Axis (Lines) ke hisaab se sort karo (Tolerance ~10px)
                raw_items.sort(key=lambda item: (round(item['top'] / 10), item['x0']))

                lines = []
                current_line = []
                last_y = -9999

                # Line Stitching Logic (Words ko sentences/cells me jodna)
                for item in raw_items:
                    if last_y != -9999 and abs(item['top'] - last_y) > 10:
                        if current_line:
                            stitched_line = []
                            current_stitch = current_line[0].copy()
                            for next_item in current_line[1:]:
                                gap = next_item['x0'] - current_stitch['x1']
                                if gap < 20: # Agar words paas hain toh ek hi cell me jodo
                                    current_stitch['text'] += ' ' + next_item['text']
                                    current_stitch['x1'] = next_item['x1']
                                    current_stitch['is_bold'] = current_stitch['is_bold'] or next_item['is_bold']
                                else:
                                    stitched_line.append(current_stitch)
                                    current_stitch = next_item.copy()
                            stitched_line.append(current_stitch)
                            lines.append(stitched_line)
                        current_line = [item]
                    else:
                        current_line.append(item)
                    last_y = item['top']

                # Aakhri line ko handle karna
                if current_line:
                    stitched_line = []
                    current_stitch = current_line[0].copy()
                    for next_item in current_line[1:]:
                        gap = next_item['x0'] - current_stitch['x1']
                        if gap < 20:
                            current_stitch['text'] += ' ' + next_item['text']
                            current_stitch['x1'] = next_item['x1']
                            current_stitch['is_bold'] = current_stitch['is_bold'] or next_item['is_bold']
                        else:
                            stitched_line.append(current_stitch)
                            current_stitch = next_item.copy()
                    stitched_line.append(current_stitch)
                    lines.append(stitched_line)

                # ==========================================
                # DYNAMIC COLUMN DETECTION (The "Pillars")
                # ==========================================
                x_counts = {}
                for row in lines:
                    for item in row:
                        snapped_x = round(item['x0'] / 10) * 10
                        x_counts[snapped_x] = x_counts.get(snapped_x, 0) + 1

                # Sabse common X positions nikalo (Max 10 columns)
                sorted_xs = sorted(x_counts.keys(), key=lambda x: x_counts[x], reverse=True)
                best_columns = []
                for x in sorted_xs:
                    if not best_columns:
                        best_columns.append(x)
                    else:
                        min_diff = min(abs(c - x) for c in best_columns)
                        if min_diff > 40: # Column ke beech ka gap
                            best_columns.append(x)
                    if len(best_columns) >= 10: 
                        break
                best_columns.sort()

                if not best_columns:
                    best_columns = [0]

                # Rows ko dynamically columns me fit karna
                for line in lines:
                    row_data = [{'text': '', 'is_bold': False} for _ in best_columns]
                    for item in line:
                        closest_col_idx = 0
                        min_diff = float('inf')
                        for idx, col_x in enumerate(best_columns):
                            diff = abs(item['x0'] - col_x)
                            if diff < min_diff:
                                min_diff = diff
                                closest_col_idx = idx

                        if row_data[closest_col_idx]['text']:
                            row_data[closest_col_idx]['text'] += ' ' + item['text']
                            row_data[closest_col_idx]['is_bold'] = row_data[closest_col_idx]['is_bold'] or item['is_bold']
                        else:
                            row_data[closest_col_idx]['text'] = item['text']
                            row_data[closest_col_idx]['is_bold'] = item['is_bold']
                    
                    all_combined_rows.append(row_data)
                
                # Page break gap
                all_combined_rows.append([{'text': '', 'is_bold': False} for _ in best_columns]) 

        if not all_combined_rows:
            return {"error": "Could not extract text from this PDF."}, 400

        # ==========================================
        # WRITING DYNAMIC EXCEL
        # ==========================================
        if format_type == 'xlsx':
            for r_idx, row_data in enumerate(all_combined_rows, start=1):
                for c_idx, cell_data in enumerate(row_data, start=1):
                    cell = ws.cell(row=r_idx, column=c_idx)
                    
                    # Sirf wahi likho jo PDF me likha hai
                    text_val = str(cell_data['text']).strip()
                    cell.value = text_val
                    
                    # Bold mapping
                    font_args = {"name": "Arial", "size": 10}
                    if cell_data['is_bold']:
                        font_args['bold'] = True
                    cell.font = Font(**font_args)
                    
                    cell.alignment = Alignment(wrap_text=True, vertical='center')
                    
                    # Agar cell me text hai ya uske aas-paas data hai toh border lagao (Table look)
                    if text_val:
                        cell.border = thin_border

            # Dynamic Column Width
            for col in ws.columns:
                max_length = 0
                column = col[0].column_letter
                for cell in col:
                    try:
                        if cell.value and len(str(cell.value)) > max_length:
                            max_length = len(cell.value)
                    except:
                        pass
                adjusted_width = min(max_length + 2, 45) # Max width 45
                ws.column_dimensions[column].width = adjusted_width

            output_buffer = io.BytesIO()
            wb.save(output_buffer)
            output_buffer.seek(0)
            
            return send_file(
                output_buffer,
                download_name='converted_document.xlsx',
                as_attachment=True,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            # For CSV Export
            csv_data = [[c['text'] for c in row] for row in all_combined_rows]
            df = pd.DataFrame(csv_data)
            output_buffer = io.BytesIO()
            df.to_csv(output_buffer, index=False, header=False)
            output_buffer.seek(0)
            return send_file(
                output_buffer,
                download_name='converted_document.csv',
                as_attachment=True,
                mimetype='text/csv'
            )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
