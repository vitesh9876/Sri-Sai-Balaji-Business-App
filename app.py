import streamlit as st
import pandas as pd
import os
from datetime import date
from dateutil.relativedelta import relativedelta
import difflib
import streamlit.components.v1 as components

# -------------------- Constants --------------------
CUSTOMER_FILE = "customers.csv"
CUSTOMER_DETAILS_FILE = "customer_details1.csv"

# -------------------- Session State Initialization --------------------
for key, default in {
    "modify_index": None,
    "delete_index": None,
    "show_add_form": False,
    "loan_done": False,
}.items():
    if key not in st.session_state:
        st.session_state[key] = default

# -------------------- Page Setup --------------------
st.set_page_config(page_title="Sri Sai Balaji App", layout="centered")
st.title("💼 Sri Sai Balaji Business App")

menu = st.sidebar.selectbox(
    "Choose Option",
    ["Billing", "Finance Calculator", "Customer History", "Customer Details"]
)

# -------------------- Billing Module --------------------
if menu == "Billing":
    st.header("💿 Jewelry & Furniture Billing")

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

# (Finance Calculator, Customer History, and Customer Details sections continue below...)

elif menu == "Finance Calculator":
    st.header("🏦 Finance Calculator")
    
    # Loan type selection inside the block
    loan_type = st.selectbox("Select Loan Type", ["Gold", "Silver"])

def calculate_total_custom_months(start_date: date, end_date: date) -> float:
if end_date <= start_date:
return 0.0

    full_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)

    try:
        anchor_date = start_date + relativedelta(months=full_months)
    except ValueError:
        anchor_date = (start_date.replace(day=1) + relativedelta(months=full_months + 1)) - relativedelta(days=1)

    if end_date >= anchor_date:
        extra_days = (end_date - anchor_date).days
        full_months += 1
    else:
        prev_anchor = start_date + relativedelta(months=full_months - 1)
        extra_days = (end_date - prev_anchor).days

    if extra_days <= 7:
        partial_month = 0
    elif 8 <= extra_days <= 15:
        partial_month = 0.5
    else:
        partial_month = 1

    return full_months - 1 + partial_month


    def get_interest_rate(amount, loan_type):
    if loan_type == "Gold":
        return 2 if amount >= 5000 else 3
    elif loan_type == "Silver":
        return 5
    else:
        return 0

def calculate_interest(principal, start_date, end_date, loan_type):
    months = calculate_total_custom_months(start_date, end_date)
    rate = get_interest_rate(principal, loan_type)
    interest = (principal / 100) * rate * months
    payable = principal + interest
    return round(months, 2), round(interest, 2), round(payable, 2)
    
    if not st.session_state.loan_done:
        with st.form("loan_form"):
            st.subheader("💰 Loan Details")
            amount = st.number_input("Loan Amount (₹)", min_value=, step=)
            start_date = st.date_input("Loan Taken Date", value=date.today())
            end_date = st.date_input("Loan Release Date", value=date.today())
            calculate = st.form_submit_button("Calculate")

        if calculate:
            if end_date <= start_date:
                st.error("❌ Return date must be after the loan date.")
            else:
                months, interest, payable = calculate_gold_loan(amount, start_date, end_date)
                st.session_state.loan_done = True
                st.session_state.amount = amount
                st.session_state.start_date = start_date
                st.session_state.end_date = end_date
                st.session_state.months = months
                st.session_state.interest = interest
                st.session_state.payable = payable 
                st.session_state.loan_type = loan_type
                st.rerun()

    if st.session_state.loan_done:
        st.success("✅ Calculation Complete!")
        st.markdown(f"""
        ### 📊 Loan Summary 
        - 🔗 **Loan Type:** {st.session_state.loan_type}
        - 🗕️ **Months Charged:** {st.session_state.months}
        - 💰 **Interest:** ₹{st.session_state.interest}
        - 📜 **Total Payable:** ₹{st.session_state.payable}
        """)

        st.subheader("📜 Customer Details for Receipt")
        name = st.text_input("Customer Name")
        item = st.text_input("Item Name (e.g. Gold Ring, Chain)")
        weight = st.text_input("Item Weight (e.g. 10g)")
        address = st.text_area("Customer Address")

        if st.button("🔄 Reset Finance Calculator"):
            st.session_state.loan_done = False
            st.rerun()

        if name and item and weight and address:
            html_content = f'''
                <div style="font-family: Arial; padding: 20px;">
                    <h2 style="text-align:center;">PRAVEEN KUMAR FINANCE</h2>
                    <p style="text-align:center;">Gandhi Road, Vijayawada, Andhra Pradesh</p>
                    <p style="text-align:center;">Date: {datetime.today().strftime("%d-%m-%Y")}</p>
                    <hr>
                    <h4>Customer Details</h4>
                    <p><b>Name:</b> {name}<br>
                    <b>Item:</b> {item}<br>
                    <b>Weight:</b> {weight}<br>
                    <b>Address:</b> {address}</p>
                    <h4>Loan Summary</h4>
                    <p><b>Loan Amount:</b> ₹{st.session_state.amount}<br>
                    <b>Start Date:</b> {st.session_state.start_date.strftime("%d-%m-%Y")}<br>
                    <b>End Date:</b> {st.session_state.end_date.strftime("%d-%m-%Y")}<br>
                    <b>Months Charged:</b> {st.session_state.months}<br>
                    <b>Interest:</b> ₹{st.session_state.interest}<br>
                    <b>Total Payable:</b> ₹{st.session_state.payable}</p>
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">🖸️ Print Receipt</button>
                </div>
            '''
            components.html(html_content, height=700)
        else:
            st.warning("Please enter all customer details to print the receipt.")

elif menu == "Customer History":
    st.header("📋 Customer History")

    if not os.path.exists(CUSTOMER_FILE):
        st.warning("⚠️ No customer data found yet.")
    else:
        data = pd.read_csv(CUSTOMER_FILE)

        if data.empty:
            st.info("ℹ️ No billing records available yet.")
        else:
            data = data.reset_index(drop=True)

            st.subheader("🔍 Search Customers")
            search_query = st.text_input("Enter Name, Bill No, Contact or Address")

            if search_query:
                search_query = search_query.lower().strip()
                filtered_data = data[
                    data["Name"].str.lower().str.contains(search_query, na=False)
                    | data["Contact"].astype(str).str.contains(search_query, na=False)
                    | data["Address"].str.lower().str.contains(search_query, na=False)
                    | data["Bill No"].astype(str).str.contains(search_query, na=False)
                ]
            else:
                filtered_data = data

            if filtered_data.empty:
                st.warning("No matching records found.")
            else:
                summary = filtered_data.groupby(["Name", "Contact", "Address"], as_index=False).agg(
                    Total_Spent=pd.NamedAgg(column="Total", aggfunc="sum"),
                    Purchases=pd.NamedAgg(column="Item", aggfunc="count")
                )

                st.subheader("📇 Matching Customers")

                for _, row in summary.iterrows():
                    name = row["Name"]
                    contact = row["Contact"]
                    address = row["Address"]
                    total = row["Total_Spent"]
                    purchases = row["Purchases"]

                    with st.expander(f"👤 {name} | 📞 {contact} | 🏠 {address} | 💸 ₹{total} | 📜 {purchases} items"):
                        customer_data = filtered_data[filtered_data["Name"] == name].sort_values("Date", ascending=False)
                        st.write("**Purchase History:**")
                        st.dataframe(customer_data[["Bill No", "Date", "Item", "Total"]], use_container_width=True)

elif menu == "Customer Details":
    st.header("🧾 Manage Customer Details")

    def load_customer_details():
        if os.path.exists(CUSTOMER_DETAILS_FILE):
            return pd.read_csv(CUSTOMER_DETAILS_FILE)
        else:
            return pd.DataFrame(columns=["Name", "Contact", "Address", "Aadhaar", "Father/Husband", "Description"])

    data = load_customer_details()

    col1, col2 = st.columns([8, 2])
    with col2:
        if st.button("➕ Add New Customer"):
            st.session_state.show_add_form = True

    if st.session_state.show_add_form:
        with st.form("add_customer_form", clear_on_submit=True):
            st.subheader("➕ Add New Customer")
            name = st.text_input("Customer Name")
            contact = st.text_input("Contact Number")
            address = st.text_area("Address")
            aadhaar = st.text_input("Aadhaar Number")
            relation = st.text_input("Father's / Husband's Name")
            description = st.text_area("Description")

            submitted = st.form_submit_button("Save Customer")
            if submitted:
                new_row = pd.DataFrame([{
                    "Name": name,
                    "Contact": contact,
                    "Address": address,
                    "Aadhaar": aadhaar,
                    "Father/Husband": relation,
                    "Description": description
                }])
                updated_data = pd.concat([data, new_row], ignore_index=True)
                updated_data.to_csv(CUSTOMER_DETAILS_FILE, index=False)
                st.success("✅ Customer added successfully!")
                st.session_state.show_add_form = False
                st.rerun()

    st.markdown("### 🔍 Search Customer")
    search_input = st.text_input("Search by Name, Contact, Aadhaar, etc.")

    if search_input:
        search_lower = search_input.lower()
        filtered_data = data[
            data.apply(lambda row: row.astype(str).str.lower().str.contains(search_lower).any(), axis=1)
        ]
    else:
        filtered_data = data.copy()

    if filtered_data.empty:
        st.info("No matching customers found.")
    else:
        st.markdown("### 👥 Customer List")
        for i, row in filtered_data.iterrows():
            with st.expander(f"👤 {row['Name']} | 📞 {row['Contact']}"):
                st.write(f"**Address:** {row['Address']}")
                st.write(f"**Aadhaar:** {row['Aadhaar']}")
                st.write(f"**Father/Husband:** {row['Father/Husband']}")
                st.write(f"**Description:** {row['Description']}")

                col_mod, col_del = st.columns([1, 1])
                with col_mod:
                    if st.button(f"✏️ Modify - {i}"):
                        st.session_state.modify_index = i
                with col_del:
                    if st.button(f"🗑️ Delete - {i}"):
                        st.session_state.delete_index = i

        if st.session_state.modify_index is not None:
            idx = st.session_state.modify_index
            customer = data.loc[idx]

            with st.form("modify_form"):
                st.subheader("✏️ Modify Customer")
                name = st.text_input("Customer Name", value=customer["Name"])
                contact = st.text_input("Contact Number", value=customer["Contact"])
                address = st.text_area("Address", value=customer["Address"])
                aadhaar = st.text_input("Aadhaar Number", value=customer["Aadhaar"])
                relation = st.text_input("Father's / Husband's Name", value=customer["Father/Husband"])
                description = st.text_area("Description", value=customer["Description"])

                modify_submit = st.form_submit_button("Update Customer")
                if modify_submit:
                    data.at[idx, "Name"] = name
                    data.at[idx, "Contact"] = contact
                    data.at[idx, "Address"] = address
                    data.at[idx, "Aadhaar"] = aadhaar
                    data.at[idx, "Father/Husband"] = relation
                    data.at[idx, "Description"] = description
                    data.to_csv(CUSTOMER_DETAILS_FILE, index=False)
                    st.success("✅ Customer details updated.")
                    st.session_state.modify_index = None
                    st.rerun()

        if st.session_state.delete_index is not None:
            idx = st.session_state.delete_index
            customer = data.loc[idx]
            st.warning(f"Are you sure you want to delete customer: **{customer['Name']}**?")
            col_yes, col_no = st.columns([1, 1])
            with col_yes:
                if st.button("✅ Yes, Delete"):
                    data = data.drop(index=idx).reset_index(drop=True)
                    data.to_csv(CUSTOMER_DETAILS_FILE, index=False)
                    st.success("🗑️ Customer deleted successfully.")
                    st.session_state.delete_index = None
                    st.rerun()
            with col_no:
                if st.button("❌ Cancel"):
                    st.session_state.delete_index = None
