const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch trips");
  }

  return res.json();
}

export async function getTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch trip");
  }

  return res.json();
}

export async function generateTrip(data: {
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
}) {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to generate trip");
  }

  return res.json();
}