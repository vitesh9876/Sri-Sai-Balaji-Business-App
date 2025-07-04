import streamlit as st
from datetime import datetime, date
import streamlit.components.v1 as components

def calculate_total_months(start_date, end_date):
    months = (end_date.year - start_date.year) * 12 + end_date.month - start_date.month + 1
    if end_date.day <= 10:
        months -= 1
    return months

def get_interest_rate(amount):
    return 2 if amount >= 5000 else 3

def calculate_gold_loan(principal, start_date, end_date):
    total_months = calculate_total_months(start_date, end_date)
    total_interest = 0
    original_principal = principal
    month_counter = 0
    
    while month_counter < total_months:
        months_this_cycle = min(12, total_months - month_counter)
        rate = get_interest_rate(principal)
        monthly_interest = (principal / 100) * rate
        cycle_interest = monthly_interest * months_this_cycle
        total_interest += cycle_interest
        principal += cycle_interest
        month_counter += months_this_cycle

    total_payable = original_principal + total_interest
    return total_months, round(total_interest, 2), round(total_payable, 2)

def finance_module():
    st.header("🏦 Gold Loan Finance Calculator")

    if not st.session_state.get("loan_done"):
        with st.form("loan_form"):
            st.subheader("💰 Loan Details")
            amount = st.number_input("Loan Amount (₹)", min_value=100.0, step=100.0)
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
                st.rerun()

    if st.session_state.get("loan_done"):
        st.success("✅ Calculation Complete!")
        st.markdown(f"""
        ### 📊 Loan Summary
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