// export const BASE_URL = "https://backend-tlar.onrender.com/api/invoices"; // Use local during dev if needed
export const BASE_URL = "https://backend-tlar.onrender.com/api/invoices";
export const fetchInvoices = async (search = "", filter = "all", startDate = "", endDate = "") => {
  const query = new URLSearchParams();
  if (search) query.append("search", search);
  if (filter) query.append("filter", filter);
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);

  const res = await fetch(`${BASE_URL}?${query.toString()}`);
  return res.json();
};

export const createInvoice = async (data) => {
  return fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
};

export const updateInvoice = async (id, data) => {
  return fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());
};

export const deleteInvoice = async (id) => {
  return fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  }).then(res => res.json());
};
