import { showWarningModal } from "./utils/showWarningModal.js";
import { fetchWithAuth } from "./utils/fetchWithAuth.js";

document.addEventListener("DOMContentLoaded", () => {
  const MEMBERSHIP_MAP = Array.isArray(window.MEMBERSHIPS) ? window.MEMBERSHIPS : [];
  if (!window.MEMBERSHIPS) {
    console.warn("⚠️ MEMBERSHIPS is not defined on window object. Membership-related logic will be skipped.");
  }

  const showInlineError = (selector, message) => {
    const errorElement = document.querySelector(selector);
    if (errorElement) {
      errorElement.classList.remove("d-none");
      errorElement.textContent = message;
    }
  };

  const clearInlineError = (selector) => {
    const errorElement = document.querySelector(selector);
    if (errorElement) {
      errorElement.classList.add("d-none");
      errorElement.textContent = "";
    }
  };

  // Auto-set membership in add modal when role is selected
  document.getElementById("add-role")?.addEventListener("change", (event) => {
    const selectedOption = event.target.selectedOptions[0];
    const defaultMembershipId = selectedOption.getAttribute("data-default-membership");
    const membershipSelect = document.getElementById("add-membership");

    const defaultMembership = MEMBERSHIP_MAP.find((membership) => String(membership.id) === String(defaultMembershipId));

    if (defaultMembership) {
      membershipSelect.value = defaultMembership.name;
    }
  });

  // Add user
  document.getElementById("addUserForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearInlineError("#add-user-error");

    const form = event.target;
    const selectedMembership = MEMBERSHIP_MAP.find(
      (m) => m.name.toLowerCase().trim() === form.membership.value.toLowerCase().trim()
    );

    if (!selectedMembership) {
      showInlineError("#add-user-error", "Invalid membership selected.");
      return;
    }

    const newUser = {
      username: form.username.value,
      email: form.email.value,
      password: form.password.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      address: form.address.value,
      phone: form.phone.value,
      roleId: parseInt(form.role.value, 10),
      membershipId: selectedMembership.id,
    };

    const modal = bootstrap.Modal.getInstance(document.getElementById("addUserModal"));

    try {
      const result = await fetchWithAuth("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      if (result.success) {
        modal?.hide();
        location.reload();
      } else {
        modal?.hide();
        showWarningModal(result.message || "Failed to add user.");
      }
    } catch (error) {
      modal?.hide();
      console.error("Add user error:", error);
      showWarningModal(error.message || "Server error while adding user.");
    }
  });

  // Edit modal setup
  const editModal = document.getElementById("editUserModal");
  editModal?.addEventListener("show.bs.modal", (event) => {
    clearInlineError("#edit-user-error");
    const user = JSON.parse(event.relatedTarget.dataset.user);

    document.getElementById("edit-id").value = user.id;
    document.getElementById("edit-username").value = user.username;
    document.getElementById("edit-email").value = user.email;
    document.getElementById("edit-firstname").value = user.firstname;
    document.getElementById("edit-lastname").value = user.lastname;
    document.getElementById("edit-address").value = user.address || "";
    document.getElementById("edit-phone").value = user.phone || "";

    const roleSelect = document.getElementById("edit-role");
    [...roleSelect.options].forEach((option) => {
      option.selected = option.value === user.Role?.name;
    });

    const membershipSelect = document.getElementById("edit-membership");
    [...membershipSelect.options].forEach((option) => {
      option.selected = option.value === user.Membership?.name;
    });
  });

  // Edit user form submit
  document.getElementById("editUserForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearInlineError("#edit-user-error");

    const form = event.target;
    const userId = form.id.value;

    const selectedMembership = MEMBERSHIP_MAP.find(
      (m) => m.name.toLowerCase().trim() === form.membership.value.toLowerCase().trim()
    );

    if (!selectedMembership) {
      showInlineError("#edit-user-error", "Invalid membership selected.");
      return;
    }

    const updatedUser = {
      username: form.username.value,
      email: form.email.value,
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      address: form.address.value,
      phone: form.phone.value,
      role: form.role.value,
      membershipId: selectedMembership.id,
    };

    const modal = bootstrap.Modal.getInstance(editModal);

    try {
      const result = await fetchWithAuth(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser),
      });

      if (result.success) {
        modal?.hide();
        location.reload();
      } else {
        modal?.hide();
        showWarningModal(result.message || "Failed to update user.");
      }
    } catch (error) {
      modal?.hide();
      console.error("Edit user error:", error);
      showWarningModal(error.message || "Server error while updating user.");
    }
  });

  // Inline role change
  document.querySelectorAll(".role-select").forEach((selectElement) => {
    selectElement.addEventListener("change", async () => {
      const userId = selectElement.dataset.userId;
      const newRoleId = parseInt(selectElement.value, 10);

      try {
        const result = await fetchWithAuth(`/api/users/${userId}/role`, {
          method: "PATCH",
          body: JSON.stringify({ roleId: newRoleId }),
        });

        if (!result.success) {
          showWarningModal(result.message || "Failed to change role.");
          return;
        }

        const defaultMembershipId = selectElement.selectedOptions[0].dataset.defaultMembership;
        const membershipName = MEMBERSHIP_MAP.find((m) => m.id === Number(defaultMembershipId))?.name;

        const row = selectElement.closest("tr");
        const membershipSelect = row.querySelector(".membership-select");

        if (membershipSelect && membershipName) {
          membershipSelect.value = membershipName;
        }

        const editBtn = row.querySelector(".edit-user-btn");
        if (editBtn) {
          const updatedUser = JSON.parse(editBtn.dataset.user);
          updatedUser.roleId = newRoleId;
          updatedUser.Role = { name: selectElement.selectedOptions[0].textContent.trim() };
          if (membershipName) {
            updatedUser.Membership = { name: membershipName };
          }
          editBtn.dataset.user = JSON.stringify(updatedUser);
        }
      } catch (error) {
        console.error("Role change error:", error);
        showWarningModal(error.message || "Error updating role.");
      }
    });
  });

  // Inline membership change
  document.querySelectorAll(".membership-select").forEach((selectElement) => {
    selectElement.addEventListener("change", async () => {
      const userId = selectElement.dataset.userId;
      const newMembership = selectElement.value;

      try {
        const result = await fetchWithAuth(`/api/users/${userId}/membership`, {
          method: "PATCH",
          body: JSON.stringify({ membership: newMembership }),
        });

        if (!result.success) {
          showWarningModal(result.message || "Failed to update membership.");
          return;
        }

        const row = selectElement.closest("tr");
        const editBtn = row.querySelector(".edit-user-btn");

        if (editBtn) {
          const updatedUser = JSON.parse(editBtn.dataset.user);
          updatedUser.Membership = { name: newMembership };
          editBtn.dataset.user = JSON.stringify(updatedUser);
        }
      } catch (error) {
        console.error("Membership change error:", error);
        showWarningModal(error.message || "Error updating membership.");
      }
    });
  });

  // Toggle status
  document.querySelectorAll(".toggle-user-status").forEach((toggleInput) => {
    toggleInput.addEventListener("change", async () => {
      const userId = toggleInput.dataset.userId;
      const endpoint = toggleInput.checked ? "reactivate" : "deactivate";

      try {
        const result = await fetchWithAuth(`/api/users/${userId}/${endpoint}`, {
          method: "PATCH",
        });

        if (result.success) {
          location.reload();
        } else {
          showWarningModal(result.message || "Failed to update status.");
        }
      } catch (error) {
        console.error("Toggle status error:", error);
        showWarningModal(error.message || "Error updating user status.");
      }
    });
  });

  // Delete user
  document.querySelectorAll(".delete-user").forEach((button) => {
    button.addEventListener("click", () => {
      const userId = button.dataset.userId;

      showWarningModal("Are you sure you want to permanently delete this user?", async () => {
        try {
          const result = await fetchWithAuth(`/api/users/${userId}`, {
            method: "DELETE",
          });

          if (result.success) {
            location.reload();
          } else {
            showWarningModal(result.message || "Failed to delete user.");
          }
        } catch (error) {
          console.error("Delete user error:", error);
          showWarningModal(error.message || "Error deleting user.");
        }
      });
    });
  });

  // ====== USER SEARCH FILTER ======
  const userSearchInput = document.getElementById("user-search");
  if (userSearchInput) {
    userSearchInput.addEventListener("input", () => {
      const query = userSearchInput.value.toLowerCase().trim();
      document.querySelectorAll("tbody tr").forEach((row) => {
        const haystack = row.dataset.search?.toLowerCase() || "";
        row.style.display = haystack.includes(query) ? "" : "none";
      });
    });
  }
});
