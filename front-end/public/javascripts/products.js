import { showWarningModal } from "/javascripts/utils/showWarningModal.js";

document.addEventListener("DOMContentLoaded", () => {
  const token =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || "";

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  attachProductListeners();

  const addProductForm = document.getElementById("addProductForm");
  const addModal = document.getElementById("addModal");

  if (addProductForm) {
    addProductForm.onsubmit = async (e) => {
      e.preventDefault();

      const newProduct = {
        name: addProductForm["add-name"].value.trim(),
        imgurl: addProductForm["add-imgurl"].value.trim(),
        description: addProductForm["add-description"].value.trim(),
        unitprice: parseFloat(addProductForm["add-unitprice"].value),
        quantity: parseInt(addProductForm["add-quantity"].value),
        CategoryId: parseInt(addProductForm["add-categoryId"].value),
        BrandId: parseInt(addProductForm["add-brandId"].value),
      };

      try {
        const res = await fetch(`/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(newProduct),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        bootstrap.Modal.getInstance(addModal)?.hide();
        await reloadProductTable();
      } catch (err) {
        console.error("❌ Failed to create product:", err);
        showWarningModal("Failed to add new product.");
      }
    };
  }
});

function attachProductListeners() {
  const token =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || "";

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const editModal = document.getElementById("editModal");
  const deleteModal = document.getElementById("deleteModal");
  const restoreModal = document.getElementById("restoreModal");

  // ====== EDIT MODAL ======
  if (editModal) {
    editModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const product = JSON.parse(button.getAttribute("data-product"));

      document.getElementById("edit-id").value = product.id;
      document.getElementById("edit-name").value = product.name;
      document.getElementById("edit-imgurl").value = product.imgurl || "";
      document.getElementById("edit-description").value = product.description || "";
      document.getElementById("edit-unitprice").value = product.unitprice || 0;
      document.getElementById("edit-quantity").value = product.quantity || 0;
      document.getElementById("edit-categoryId").value = product.CategoryId;
      document.getElementById("edit-brandId").value = product.BrandId;

      const form = document.getElementById("editProductForm");
      form.onsubmit = async (e) => {
        e.preventDefault();

        const updated = {
          name: form["edit-name"].value.trim(),
          imgurl: form["edit-imgurl"].value.trim(),
          description: form["edit-description"].value.trim(),
          unitprice: parseFloat(form["edit-unitprice"].value),
          quantity: parseInt(form["edit-quantity"].value),
          CategoryId: parseInt(form["edit-categoryId"].value),
          BrandId: parseInt(form["edit-brandId"].value),
        };

        try {
          const res = await fetch(`/api/products/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify(updated),
          });

          const data = await res.json();
          if (!data.success) throw new Error(data.message);

          bootstrap.Modal.getInstance(editModal)?.hide();
          await reloadProductTable();
        } catch (err) {
          console.error("❌ Failed to update product:", err);
          showWarningModal("Failed to update product.");
        }
      };
    });
  }

  // ====== DELETE MODAL ======
  if (deleteModal) {
    deleteModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const productId = button.getAttribute("data-id");
      const productName = button.getAttribute("data-name");

      document.getElementById("delete-product-name").textContent = productName;
      const form = document.getElementById("deleteProductForm");

      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`/api/products/${productId}`, {
            method: "DELETE",
            headers: authHeaders,
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);

          bootstrap.Modal.getInstance(deleteModal)?.hide();
          await reloadProductTable();
        } catch (err) {
          console.error("❌ Failed to delete product:", err);
          showWarningModal("Failed to delete product.");
        }
      };
    });
  }

  // ====== RESTORE MODAL ======
  if (restoreModal) {
    restoreModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const productId = button.getAttribute("data-id");
      const productName = button.getAttribute("data-name");

      document.getElementById("restore-product-name").textContent = productName;
      const form = document.getElementById("restoreProductForm");

      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`/api/products/${productId}/restore`, {
            method: "PATCH",
            headers: authHeaders,
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message);

          bootstrap.Modal.getInstance(restoreModal)?.hide();
          await reloadProductTable();
        } catch (err) {
          console.error("❌ Failed to restore product:", err);
          showWarningModal("Failed to restore product.");
        }
      };
    });
  }

  // ====== DELETE/RESTORE TOGGLER ======
  document.querySelectorAll(".admin-delete-toggle").forEach((toggle) => {
    toggle.addEventListener("change", async () => {
      const productId = toggle.getAttribute("data-id");
      const isChecked = toggle.checked;

      try {
        const response = await fetch(`/api/products/${productId}${isChecked ? "" : "/restore"}`, {
          method: isChecked ? "DELETE" : "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders },
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        await reloadProductTable();
      } catch (err) {
        console.error("❌ Toggle failed:", err.message);
        toggle.checked = !isChecked;
        showWarningModal("Something went wrong. Try again.");
      }
    });
  });
}

async function reloadProductTable() {
  const tableBody = document.querySelector(".admin-products-table tbody");
  const form = document.querySelector("form[action='/products']");
  const formData = new FormData(form);
  const params = new URLSearchParams(formData).toString();

  try {
    const res = await fetch(`/products/partial?${params}`);
    if (!res.ok) throw new Error("Failed to load updated table");

    const html = await res.text();
    tableBody.innerHTML = html;

    attachProductListeners();
  } catch (err) {
    console.error("❌ Reload failed:", err.message);
    showWarningModal("Could not refresh product table");
  }
}
