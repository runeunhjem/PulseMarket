document.addEventListener("DOMContentLoaded", () => {
  window.submitSort = function (sortValue) {
    const form = document.getElementById("search-form");

    if (form) {
      // Remove all hidden inputs from previous submissions
      form.querySelectorAll("input[type='hidden']").forEach((input) => input.remove());

      // Create and add new hidden input for sort
      const sortInput = document.createElement("input");
      sortInput.type = "hidden";
      sortInput.name = "sort";
      sortInput.id = "sort-input";
      sortInput.value = sortValue;
      form.appendChild(sortInput);

      // Add filters and search term from current URL if they exist
      const urlParams = new URLSearchParams(window.location.search);
      ["name", "category", "brand"].forEach((key) => {
        const value = urlParams.getAll(key).find((val) => val && val.trim());
        if (value) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value.trim();
          form.appendChild(input);
        }
      });

      // Use current path (either /products or /search) to stay on same page
      form.action = window.location.pathname;

      form.submit();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set("sort", sortValue);
      window.location.href = url.toString();
    }
  };
});
