from fpdf import FPDF
from io import BytesIO

def generate_pdf(name, contact, address, item, total, bill_date):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, "Sri Sai Balaji Jewelry and Furniture", ln=True, align='C')
    pdf.set_font("Arial", '', 12)
    pdf.cell(200, 10, "Address: Gandhi Road, Vijayawada", ln=True, align='C')
    pdf.cell(200, 10, "GST No: 37XXXXXXXXX1Z5", ln=True, align='C')
    pdf.cell(200, 10, f"Date of Billing: {bill_date}", ln=True, align='C')
    pdf.ln(10)

    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, "Customer Details", ln=True)
    pdf.set_font("Arial", '', 12)
    pdf.cell(200, 8, f"Name: {name}", ln=True)
    pdf.cell(200, 8, f"Contact: {contact}", ln=True)
    pdf.cell(200, 8, f"Address: {address}", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, "Purchase Summary", ln=True)
    pdf.set_font("Arial", '', 12)
    pdf.cell(200, 8, f"Item: {item}", ln=True)
    pdf.cell(200, 8, f"Total Amount: Rs. {total}", ln=True)

    # ✅ Fix: return as binary string and wrap in BytesIO
    pdf_output = pdf.output(dest='S').encode('latin-1')
    return BytesIO(pdf_output)
