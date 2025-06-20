import { fetchWithAuth } from "/javascripts/utils/fetchWithAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    const categorySelect = document.getElementById("category-select");
    const brandSelect = document.getElementById("brand-select");

    const filterPanel = document.getElementById("filter-panel");
    const overlay = document.getElementById("overlay");
    const toggleBtn = document.getElementById("toggle-filter");

    const categoryContainer = document.getElementById("category-checkboxes");
    const brandContainer = document.getElementById("brand-checkboxes");

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get("category") || "";
    const selectedBrand = urlParams.get("brand") || "";

    try {
      // ✅ No .json() needed
      const catData = await fetchWithAuth("/api/categories");
      if (catData.success) {
        const sortedCategories = catData.data.sort((a, b) => a.name.localeCompare(b.name));

        if (categorySelect) {
          categorySelect.innerHTML =
            `<option value="">All Categories</option>` +
            sortedCategories
              .map((cat) => {
                const selectedAttr = cat.name === selectedCategory ? "selected" : "";
                return `<option value="${cat.name}" ${selectedAttr}>${cat.name}</option>`;
              })
              .join("");
        }

        if (categoryContainer) {
          categoryContainer.innerHTML = sortedCategories
            .map((cat) => {
              const checkedAttr = cat.name === selectedCategory ? "checked" : "";
              return `
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" name="category" value="${cat.name}" id="cat-${cat.id}" ${checkedAttr} />
                  <label class="form-check-label" for="cat-${cat.id}">${cat.name}</label>
                </div>`;
            })
            .join("");
        }
      }

      const brandData = await fetchWithAuth("/api/brands");
      if (brandData.success) {
        const sortedBrands = brandData.data.sort((a, b) => a.name.localeCompare(b.name));

        if (brandSelect) {
          brandSelect.innerHTML =
            `<option value="">All Brands</option>` +
            sortedBrands
              .map((brand) => {
                const selectedAttr = brand.name === selectedBrand ? "selected" : "";
                return `<option value="${brand.name}" ${selectedAttr}>${brand.name}</option>`;
              })
              .join("");
        }

        if (brandContainer) {
          brandContainer.innerHTML = sortedBrands
            .map((brand) => {
              const checkedAttr = brand.name === selectedBrand ? "checked" : "";
              return `
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" name="brand" value="${brand.name}" id="brand-${brand.id}" ${checkedAttr} />
                  <label class="form-check-label" for="brand-${brand.id}">${brand.name}</label>
                </div>`;
            })
            .join("");
        }
      }
    } catch (err) {
      console.error("❌ Failed to load filters:", err.message);
    }

    if (toggleBtn && filterPanel && overlay) {
      toggleBtn.addEventListener("click", () => {
        filterPanel.classList.toggle("open");
        overlay.classList.toggle("visible");
      });

      overlay.addEventListener("click", () => {
        filterPanel.classList.remove("open");
        overlay.classList.remove("visible");
      });
    }
  })();
});
