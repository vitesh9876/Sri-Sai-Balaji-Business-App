import streamlit as st
import pandas as pd
import os

CUSTOMER_DETAILS_FILE = "customer_details1.csv"
st.rerun()
def load_customer_details():
    if os.path.exists(CUSTOMER_DETAILS_FILE):
        return pd.read_csv(CUSTOMER_DETAILS_FILE)
    else:
        return pd.DataFrame(columns=["Name", "Contact", "Address", "Aadhaar", "Father/Husband", "Description"])

def details_module():
    st.header("🧾 Manage Customer Details")

    data = load_customer_details()

    col1, col2 = st.columns([8, 2])
    with col2:
        if st.button("➕ Add New Customer"):
            st.session_state.show_add_form = True

    if st.session_state.get("show_add_form"):
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

        if st.session_state.get("modify_index") is not None:
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

        if st.session_state.get("delete_index") is not None:
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