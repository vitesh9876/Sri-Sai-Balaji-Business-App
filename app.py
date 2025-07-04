import streamlit as st
from billing import billing_module
from finance_calculator import finance_module
from customer_history import history_module
from customer_details import details_module

st.set_page_config(page_title="Sri Sai Balaji App", layout="centered")
st.title("💼 Sri Sai Balaji Business App")

menu = st.sidebar.selectbox(
    "Choose Option",
    ["Billing", "Finance Calculator", "Customer History", "Customer Details"]
)

if menu == "Billing":
    billing_module()

elif menu == "Finance Calculator":
    finance_module()

elif menu == "Customer History":
    history_module()

elif menu == "Customer Details":
    details_module()