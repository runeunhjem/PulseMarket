let debounceTimeout;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const resultsBox = document.getElementById("search-results");

  if (!input || !resultsBox) return;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimeout);

    const query = input.value.trim();
    if (!query) {
      resultsBox.innerHTML = "";
      resultsBox.classList.add("d-none");
      return;
    }

    debounceTimeout = setTimeout(() => {
      fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
            resultsBox.innerHTML = `<p class="text-light px-3">No products found.</p>`;
            resultsBox.classList.remove("d-none");
            return;
          }

          resultsBox.innerHTML = data.data
            .map(
              (p) => `
                <div class="search-item d-flex align-items-center p-2 border-bottom">
                  <img src="${p.image}" alt="${p.name}" class="me-3 rounded" style="width: 60px; height: 60px; object-fit: cover;" />
                  <div>
                    <div class="fw-bold text-light">${p.name}</div>
                    <small class="text-warning">${p.category}</small><br />
                    <small class="text-success">Price: ${p.unitprice} NOK</small>
                  </div>
                </div>`
            )
            .join("");
          resultsBox.classList.remove("d-none");
        })
        .catch((err) => {
          console.error("Search failed:", err);
          resultsBox.innerHTML = `<p class="text-danger px-3">Search error occurred.</p>`;
          resultsBox.classList.remove("d-none");
        });
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!resultsBox.contains(e.target) && e.target !== input) {
      resultsBox.classList.add("d-none");
    }
  });
});
