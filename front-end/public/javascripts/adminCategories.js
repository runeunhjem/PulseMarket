import { fetchWithAuth } from "/javascripts/utils/fetchWithAuth.js";
import { showWarningModal } from "/javascripts/utils/showWarningModal.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addCategoryForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("category-add-name").value.trim();
    try {
      const data = await fetchWithAuth("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (!data.success) throw new Error(data.message);
      location.reload();
    } catch (err) {
      showWarningModal("Failed to add category: " + err.message);
    }
  });

  const editModal = document.getElementById("editCategoryModal");
  if (editModal) {
    editModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      document.getElementById("edit-id").value = button.getAttribute("data-id");
      document.getElementById("edit-name").value = button.getAttribute("data-name");
    });

    document.getElementById("editCategoryForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-id").value;
      const name = document.getElementById("edit-name").value.trim();
      try {
        const data = await fetchWithAuth(`/api/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name }),
        });

        if (!data.success) throw new Error(data.message);
        location.reload();
      } catch (err) {
        showWarningModal("Failed to update category: " + err.message);
      }
    });
  }

  let pendingDeleteId = null;
  let pendingDeleteName = null;

  document.querySelectorAll(".delete-category-btn").forEach((button) => {
    button.addEventListener("click", () => {
      pendingDeleteId = button.dataset.id;
      pendingDeleteName = button.dataset.name;

      const messageEl = document.getElementById("confirmModalMessage");
      messageEl.textContent = `Are you sure you want to delete category '${pendingDeleteName}'?`;

      const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
      confirmModal.show();
    });
  });

  document.getElementById("confirmDeleteBtn")?.addEventListener("click", async () => {
    const confirmButton = document.getElementById("confirmDeleteBtn");
    confirmButton.blur();

    const confirmModalInstance = bootstrap.Modal.getInstance(document.getElementById("confirmModal"));
    confirmModalInstance.hide();

    if (!pendingDeleteId) return;

    try {
      const data = await fetchWithAuth(`/api/categories/${pendingDeleteId}`, {
        method: "DELETE",
      });

      if (!data.success) throw new Error(data.message);
      location.reload();
    } catch (err) {
      showWarningModal("Failed to delete category: " + err.message);
    }
  });

});
