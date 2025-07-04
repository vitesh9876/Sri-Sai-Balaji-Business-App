import streamlit as st
import pandas as pd
import os

CUSTOMER_FILE = "customers.csv"

def history_module():
    st.header("📋 Customer History")

    if not os.path.exists(CUSTOMER_FILE):
        st.warning("⚠️ No customer data found yet.")
        return

    data = pd.read_csv(CUSTOMER_FILE)
    if data.empty:
        st.info("ℹ️ No billing records available yet.")
        return

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