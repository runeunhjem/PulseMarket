document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".modal").forEach((modalEl) => {
    modalEl.addEventListener("hide.bs.modal", () => {
      document.activeElement?.blur();
    });
  });
});
