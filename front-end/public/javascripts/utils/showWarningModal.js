export function showWarningModal(message, onConfirm) {
  const warningModalElement = document.getElementById("warningModal");
  const warningText = document.getElementById("warningModalText");
  const confirmBtn = document.getElementById("warningModalConfirm");
  const cancelBtn = warningModalElement.querySelector(".btn-secondary");

  warningText.textContent = message;

  const hasConfirm = typeof onConfirm === "function";
  confirmBtn.style.display = hasConfirm ? "inline-block" : "none";

  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  if (hasConfirm) {
    newConfirmBtn.addEventListener("click", () => {
      document.activeElement?.blur();
      bootstrap.Modal.getInstance(warningModalElement)?.hide();

      setTimeout(() => {
        onConfirm();
      }, 200);
    });
  }

  warningModalElement.addEventListener(
    "shown.bs.modal",
    () => {
      warningModalElement.removeAttribute("aria-hidden");
      if (hasConfirm) {
        newConfirmBtn.focus();
      } else {
        cancelBtn?.focus();
      }
    },
    { once: true }
  );

  warningModalElement.addEventListener("hide.bs.modal", () => {
    document.activeElement?.blur();
  });

  const warningModal = new bootstrap.Modal(warningModalElement);
  warningModal.show();
}
