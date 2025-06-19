import { showWarningModal } from "./utils/showWarningModal.js";

// Clear Cart
const clearCartForm = document.getElementById("clear-cart-form");
if (clearCartForm) {
  clearCartForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showWarningModal("Are you sure you want to clear your cart?", () => clearCartForm.submit());
  });
}

// Remove individual item
document.querySelectorAll(".cart-remove-form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const productName = form.dataset.productName || "this item";
    showWarningModal(`Are you sure you want to remove "${productName}" from your cart?`, () => form.submit());
  });
});
