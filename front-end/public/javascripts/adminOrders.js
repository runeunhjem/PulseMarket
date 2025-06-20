import { showWarningModal } from "/javascripts/utils/showWarningModal.js";
import { fetchWithAuth } from "/javascripts/utils/fetchWithAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("order-search");
  const rows = document.querySelectorAll("tbody tr");

  // Live search
  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    rows.forEach((row) => {
      const searchable = row.getAttribute("data-search")?.toLowerCase() || "";
      row.style.display = searchable.includes(query) ? "" : "none";
    });
  });

  // Status update
  const statusForms = document.querySelectorAll(".status-form");

  statusForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const orderId = form.dataset.orderId;
      const newStatus = form.querySelector("select").value;

      try {
        const result = await fetchWithAuth(`/admin/orders/${orderId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        });

        showWarningModal(result.message);
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        console.error(err);
        showWarningModal("❌ Failed to update order status.");
      }
    });
  });
});
