import { fetchWithAuth } from "/javascripts/utils/fetchWithAuth.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const result = await fetchWithAuth("/categories");


    if (!result.success) throw new Error(result.message);

    const categories = result.data;
    const container = document.getElementById("category-nav");

    const urlParams = new URLSearchParams(window.location.search);
    const activeCategory = urlParams.get("category") || "";

    if (container && Array.isArray(categories)) {
      container.innerHTML = `
        <a href="/products" class="btn ${activeCategory === "" ? "btn-primary" : "btn-secondary"} me-2 mb-2">All</a>
        ${categories
          .map((cat) => {
            const isActive = cat.name === activeCategory;
            return `<a href="/products?category=${encodeURIComponent(cat.name)}"
                       class="btn ${isActive ? "btn-primary" : "btn-outline-light"} me-2 mb-2">
                       ${cat.name}
                     </a>`;
          })
          .join("")}
      `;
    }
  } catch (err) {
    console.error("Failed to load categories:", err.message);
  }
});
