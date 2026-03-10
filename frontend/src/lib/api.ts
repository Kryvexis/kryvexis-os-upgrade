const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`);

    if (!res.ok) {
      throw new Error("API error");
    }

    return await res.json();
  } catch (err) {
    console.warn("API failed, using fallback data", err);
    return null;
  }
}

export async function getDashboard(role: string) {
  return request(`/api/dashboard?role=${role}`);
}

export async function getCustomers() {
  return request(`/api/customers`);
}

export async function getQuotes() {
  return request(`/api/quotes`);
}

export async function getInvoices() {
  return request(`/api/invoices`);
}

export async function getProducts() {
  return request(`/api/products`);
}

export async function getPayments() {
  return request(`/api/payments`);
}

export async function getRoles() {
  return request(`/api/roles`);
}

export async function getSettings() {
  return request(`/api/settings`);
}