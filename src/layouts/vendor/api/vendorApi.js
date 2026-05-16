const BASE_URL = "https://backend-tlar.onrender.com/api/vendors";

export const fetchVendors = async () => {
  const res = await fetch(BASE_URL);
  return res.json();
};

export const createVendor = async (data) => {
  return fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const updateVendor = async (id, data) => {
  return fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteVendor = async (id) => {
  return fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });
};