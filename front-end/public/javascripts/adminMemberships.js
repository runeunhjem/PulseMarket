import { fetchWithAuth } from "/javascripts/utils/fetchWithAuth.js";
import { showWarningModal } from "/javascripts/utils/showWarningModal.js";

document.addEventListener("DOMContentLoaded", () => {
  let membershipIdToDelete = null;

  // ADD Membership
  document.getElementById("addMembershipForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const newMembership = {
      name: form.name.value.trim(),
      minQty: parseInt(form.minQty.value),
      maxQty: form.maxQty.value ? parseInt(form.maxQty.value) : null,
      discount: parseInt(form.discount.value),
    };

    const modal = bootstrap.Modal.getInstance(document.getElementById("addMembershipModal"));

    try {
      const result = await fetchWithAuth("/api/memberships", {
        method: "POST",
        body: JSON.stringify(newMembership),
      });

      if (result.success) {
        modal.hide();
        form.reset();
        location.reload();
      } else {
        modal.hide();
        showWarningModal(result.message || "Failed to add membership.");
      }
    } catch (error) {
      modal.hide();
      showWarningModal(error.message || "Server error while adding membership.");
    }
  });

  // EDIT Modal Population
  document.getElementById("editMembershipModal")?.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;
    const form = document.getElementById("editMembershipForm");

    form.id.value = button.dataset.id;
    form.name.value = button.dataset.name;
    form.minQty.value = button.dataset.minqty;
    form.maxQty.value = button.dataset.maxqty || "";
    form.discount.value = button.dataset.discount;
  });

  // EDIT Submit
  document.getElementById("editMembershipForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value;

    const updatedMembership = {
      name: form.name.value.trim(),
      minQty: parseInt(form.minQty.value),
      maxQty: form.maxQty.value ? parseInt(form.maxQty.value) : null,
      discount: parseInt(form.discount.value),
    };

    const modal = bootstrap.Modal.getInstance(document.getElementById("editMembershipModal"));

    try {
      const result = await fetchWithAuth(`/api/memberships/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedMembership),
      });

      if (result.success) {
        modal.hide();
        location.reload();
      } else {
        modal.hide();
        showWarningModal(result.message || "Failed to update membership.");
      }
    } catch (error) {
      modal.hide();
      showWarningModal(error.message || "Server error while updating membership.");
    }
  });

  // DELETE Membership
  document.querySelectorAll(".delete-membership-btn").forEach((button) => {
    button.addEventListener("click", () => {
      membershipIdToDelete = button.dataset.id;
      document.getElementById("membershipToDeleteName").textContent = `'${button.dataset.name}'`;

      const modal = new bootstrap.Modal(document.getElementById("deleteMembershipModal"));
      modal.show();
    });
  });

  document.getElementById("confirmDeleteMembership")?.addEventListener("click", async () => {
    if (!membershipIdToDelete) return;

    const modal = bootstrap.Modal.getInstance(document.getElementById("deleteMembershipModal"));
    modal.hide();

    try {
      const result = await fetchWithAuth(`/api/memberships/${membershipIdToDelete}`, {
        method: "DELETE",
      });

      if (result.success) {
        location.reload();
      } else {
        showWarningModal("Failed to delete membership: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      showWarningModal(error.message || "Server error while deleting membership.");
    }
  });
});
