import streamlit as st
import pandas as pd
from datetime import datetime
import difflib
import os
import streamlit.components.v1 as components

CUSTOMER_FILE = "customers.csv"

def load_data():
    if os.path.exists(CUSTOMER_FILE):
        data = pd.read_csv(CUSTOMER_FILE)
        if "Bill No" not in data.columns:
            data.insert(0, "Bill No", range(1, len(data) + 1))
        else:
            data["Bill No"] = pd.to_numeric(data["Bill No"], errors="coerce").fillna(0)
        return data
    else:
        return pd.DataFrame(columns=["Bill No", "Date", "Name", "Contact", "Address", "Item", "Total"])

def billing_module():
    st.header("💿 Jewelry & Furniture Billing")
    data = load_data()
    if data.empty:
        data["Bill No"] = pd.Series(dtype='int')

    next_bill_no = int(data["Bill No"].max()) + 1 if not data["Bill No"].empty else 1

    typed_name = st.text_input("Enter Customer Name")
    names_list = data["Name"].dropna().astype(str).unique()
    suggestions = difflib.get_close_matches(typed_name, names_list, n=5, cutoff=0.3) if typed_name else []
    selected_customer = st.selectbox("🔍 Suggested Customers", ["-- New Customer --"] + list(suggestions))

    if selected_customer != "-- New Customer --":
        customer_rows = data[data["Name"] == selected_customer]
        last_row = customer_rows.iloc[-1] if not customer_rows.empty else {}
        default_name = selected_customer
        default_contact = last_row.get("Contact", "")
        default_address = last_row.get("Address", "")
    else:
        default_name = typed_name
        default_contact = ""
        default_address = ""

    with st.form("billing_form"):
        st.markdown(f"**💿 Bill No: `{next_bill_no}`**")
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("Customer Name", value=default_name)
        with col2:
            contact = st.text_input("Contact Number", value=default_contact)
        address = st.text_area("Customer Address", value=default_address)

        st.markdown("### 📦 Items List (Editable Table)")
        default_items = pd.DataFrame({
            "Item Name": [""],
            "Quantity": [0],
            "Weight (g)": [0],
            "Price per Item (₹)": [0],
        })
        item_table = st.data_editor(default_items, num_rows="dynamic", use_container_width=True)
        item_table = item_table.dropna()
        item_table = item_table[item_table["Item Name"].astype(str).str.strip() != ""]
        item_table["Total"] = item_table["Quantity"] * item_table["Price per Item (₹)"]
        gross_total = item_table["Total"].sum()

        st.markdown(f"### 💰 Gross Total: ₹{gross_total:.2f}")
        exchange = st.checkbox("🔁 Exchange Item?")
        exchange_value = st.number_input("Enter Exchange Item Value (₹)", min_value=0.0, step=100.0) if exchange else 0
        final_total = gross_total - exchange_value
        st.markdown(f"### 📜 Final Payable Amount: ₹{final_total:.2f}")
        submitted = st.form_submit_button("Generate & Print Bill")

    if submitted:
        if not name.strip() or not contact.strip() or item_table.empty:
            st.error("❌ Please fill in all required fields and add at least one item.")
        else:
            date_str = datetime.now().strftime("%d-%m-%Y")
            item_summary_text = "; ".join([
                f'{int(row["Quantity"])} x {row["Item Name"]} ({row["Weight (g)"]}g)'
                for _, row in item_table.iterrows()
            ])
            new_entry = pd.DataFrame([{ 
                "Bill No": next_bill_no,
                "Date": date_str,
                "Name": name,
                "Contact": contact,
                "Address": address,
                "Item": item_summary_text,
                "Total": final_total
            }])
            full_data = pd.concat([data, new_entry], ignore_index=True)
            full_data.to_csv(CUSTOMER_FILE, index=False)

            items_html = "".join([
                f"<tr><td>{row['Item Name']}</td><td>{int(row['Quantity'])}</td><td>{row['Weight (g)']}</td><td>{row['Price per Item (₹)']}</td><td>{row['Total']:.2f}</td></tr>"
                for _, row in item_table.iterrows()
            ])
            html_preview = f'''
                <div style="font-family: Arial; padding: 20px;">
                    <h2 style="text-align:center;">Sri Sai Balaji Jewelry and Furniture</h2>
                    <p style="text-align:center;">Gandhi Road, Vijayawada | GST No: 37XXXXXXXXX1Z5</p>
                    <hr>
                    <h4>💿 Bill No: {next_bill_no} | Date: {date_str}</h4>
                    <h4>👤 Customer Details</h4>
                    <p><b>Name:</b> {name}<br><b>Contact:</b> {contact}<br><b>Address:</b> {address}</p>
                    <h4>📦 Purchase Summary</h4>
                    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                        <tr style="background-color: #f2f2f2;">
                            <th>Item</th><th>Qty</th><th>Weight (g)</th><th>Price (₹)</th><th>Total (₹)</th>
                        </tr>
                        {items_html}
                    </table>
                    <h4>💰 Gross Total: ₹{gross_total:.2f}</h4>
                    <h4>🔁 Exchange Item Value: ₹{exchange_value:.2f}</h4>
                    <h2>📜 Final Payable: ₹{final_total:.2f}</h2>
                    <br><br>
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">🖸️ Print Bill</button>
                </div>
            '''
            components.html(html_preview, height=800)
            st.success("✅ Bill saved and ready for printing!")