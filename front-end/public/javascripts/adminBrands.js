import { fetchWithAuth } from "/javascripts/utils/fetchWithAuth.js";
import { showWarningModal } from "/javascripts/utils/showWarningModal.js";

document.addEventListener("DOMContentLoaded", () => {
  // ADD BRAND
  document.getElementById("addBrandForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("brand-add-name").value.trim();

    try {
      const data = await fetchWithAuth("/api/brands", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (!data.success) throw new Error(data.message);

      const addModalInstance = bootstrap.Modal.getInstance(document.getElementById("addBrandModal"));
      addModalInstance.hide();

      location.reload();
    } catch (err) {
      showWarningModal("Failed to add brand: " + err.message);
    }
  });

  // EDIT BRAND
  const editModal = document.getElementById("editBrandModal");
  if (editModal) {
    editModal.addEventListener("show.bs.modal", (event) => {
      document.querySelectorAll(".modal.show").forEach((openModalEl) => {
        const modalInstance = bootstrap.Modal.getInstance(openModalEl);
        if (modalInstance) modalInstance.hide();
      });

      const button = event.relatedTarget;
      document.getElementById("edit-id").value = button.getAttribute("data-id");
      document.getElementById("edit-name").value = button.getAttribute("data-name");
    });

    document.getElementById("editBrandForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-id").value;
      const name = document.getElementById("edit-name").value.trim();

      try {
        const data = await fetchWithAuth(`/api/brands/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name }),
        });

        if (!data.success) throw new Error(data.message);

        const editModalInstance = bootstrap.Modal.getInstance(editModal);
        editModalInstance.hide();

        location.reload();
      } catch (err) {
        showWarningModal("Failed to update brand: " + err.message);
      }
    });
  }

  // DELETE BRAND
  const deleteModal = document.getElementById("deleteBrandModal");
  if (deleteModal) {
    deleteModal.addEventListener("show.bs.modal", (event) => {
      document.querySelectorAll(".modal.show").forEach((openModalEl) => {
        const modalInstance = bootstrap.Modal.getInstance(openModalEl);
        if (modalInstance) modalInstance.hide();
      });
      const button = event.relatedTarget;
      document.getElementById("delete-id").value = button.getAttribute("data-id");
      document.getElementById("delete-brand-name").textContent = button.getAttribute("data-name");
    });

    document.getElementById("deleteBrandForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("delete-id").value;

      try {
        const data = await fetchWithAuth(`/api/brands/${id}`, { method: "DELETE" });


        const deleteModalInstance = bootstrap.Modal.getInstance(deleteModal);
        deleteModalInstance.hide();

        if (!data.success) throw new Error(data.message);

        location.reload();
      } catch (err) {
        const deleteModalInstance = bootstrap.Modal.getInstance(deleteModal);
        deleteModalInstance.hide();

        setTimeout(() => {
          showWarningModal("Failed to delete brand: " + err.message);
        }, 200);

      }

    });
  }
});
