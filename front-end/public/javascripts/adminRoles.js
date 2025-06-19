import { fetchWithAuth } from "./utils/fetchWithAuth.js";
import { showWarningModal } from "./utils/showWarningModal.js";

document.addEventListener("DOMContentLoaded", () => {
  const showError = (selector, message) => {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.remove("d-none");
      el.textContent = message;
    }
  };

  const clearError = (selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add("d-none");
      el.textContent = "";
    }
  };

  // ===== ADD ROLE =====
  document.getElementById("addRoleForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError("#add-role-error");

    const form = e.target;
    const role = {
      name: form.name.value.trim(),
      isAdmin: form.isAdmin.checked,
      defaultMembershipId: form.defaultMembershipId.value || null,
    };

    if (role.name.length < 2) {
      showWarningModal("Role name must be at least 2 characters.");
      return;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById("addRoleModal"));

    try {
      const result = await fetchWithAuth("/api/roles", {
        method: "POST",
        body: JSON.stringify(role),
      });

      if (result.success) {
        modal.hide();
        location.reload();
      } else {
        modal.hide();
        showWarningModal(result.message || "Failed to add role.");
      }
    } catch (err) {
      modal.hide();
      console.error("Add role error:", err);
      showWarningModal(err.message || "Server error while adding role.");
    }
  });

  // ===== EDIT MODAL POPULATE =====
  const editModalEl = document.getElementById("editRoleModal");
  editModalEl?.addEventListener("show.bs.modal", (event) => {
    clearError("#edit-role-error");

    const addModal = bootstrap.Modal.getInstance(document.getElementById("addRoleModal"));
    if (addModal) addModal.hide();

    const button = event.relatedTarget;

    document.getElementById("edit-id").value = button.dataset.id;
    document.getElementById("edit-name").value = button.dataset.name;
    document.getElementById("edit-isAdmin").checked = button.dataset.isAdmin === "true";

    const membershipId = button.dataset.membershipId;
    const select = document.getElementById("edit-defaultMembershipId");

    [...select.options].forEach((opt) => {
      opt.selected = opt.value === membershipId;
    });
  });

  // ===== EDIT ROLE =====
  document.getElementById("editRoleForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError("#edit-role-error");

    const form = e.target;
    const id = form.id.value;
    const updatedRole = {
      name: form.name.value.trim(),
      isAdmin: form.isAdmin.checked,
      defaultMembershipId: form.defaultMembershipId.value || null,
    };

    if (updatedRole.name.length < 2) {
      showWarningModal("Role name must be at least 2 characters.");
      return;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById("editRoleModal"));

    try {
      const result = await fetchWithAuth(`/api/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedRole),
      });

      if (result.success) {
        modal.hide();
        location.reload();
      } else {
        modal.hide();
        showWarningModal(result.message || "Failed to update role.");
      }
    } catch (err) {
      modal.hide();
      console.error("Edit role error:", err);
      showWarningModal(err.message || "Server error while updating role.");
    }
  });

  // ===== DELETE ROLE =====
  let roleIdToDelete = null;

  document.querySelectorAll(".delete-role-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      roleIdToDelete = btn.dataset.id;
      document.getElementById("roleToDeleteName").textContent = btn.dataset.name;
      const modal = new bootstrap.Modal(document.getElementById("deleteRoleModal"));
      modal.show();
    });
  });

  document.getElementById("confirmDeleteRole")?.addEventListener("click", async () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById("deleteRoleModal"));
    modal.hide();

    if (!roleIdToDelete) return;

    try {
      const result = await fetchWithAuth(`/api/roles/${roleIdToDelete}`, {
        method: "DELETE",
      });

      if (result.success) location.reload();
      else showWarningModal("Failed to delete role: " + (result.message || "Unknown error"));
    } catch (err) {
      console.error("Delete role error:", err);
      showWarningModal(err.message || "Server error while deleting role.");
    }
  });
});
