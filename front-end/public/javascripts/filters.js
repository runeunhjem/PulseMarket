document.addEventListener("DOMContentLoaded", () => {
  const filterFormElement = document.querySelector("#filter-panel form");

  if (!filterFormElement) return;

  filterFormElement.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();

    // Clear any previous hidden inputs
    const hiddenInputs = filterFormElement.querySelectorAll("input[type='hidden']");
    hiddenInputs.forEach((el) => el.remove());

    const urlParams = new URLSearchParams();

    // Add checked categories
    const checkedCategories = filterFormElement.querySelectorAll("input[name='category']:checked");
    checkedCategories.forEach((checkbox) => {
      urlParams.append("category", checkbox.value);
    });

    // Add checked brands
    const checkedBrands = filterFormElement.querySelectorAll("input[name='brand']:checked");
    checkedBrands.forEach((checkbox) => {
      urlParams.append("brand", checkbox.value);
    });

    // Preserve current sort and name filter from the URL
    const currentParams = new URLSearchParams(window.location.search);
    const name = currentParams.get("name");
    const sort = currentParams.get("sort");

    if (name) urlParams.set("name", name);
    if (sort) urlParams.set("sort", sort);

    // Navigate to the same path with new query string
    const actionPath = filterFormElement.getAttribute("action") || window.location.pathname;
    const newUrl = `${actionPath}?${urlParams.toString()}`;
    window.location.href = newUrl;
  });
});
