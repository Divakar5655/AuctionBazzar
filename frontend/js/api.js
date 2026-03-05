export const API_BASE = "https://auctionbazzar-api.onrender.com/api";

function getToken() {
  const t = localStorage.getItem("token");
  console.log("TOKEN:", t);
  return t;
}

export async function api(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}