document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", () => {
    const submitButton = form.querySelector('button[type="submit"], button:not([type])');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Processing...";
    }
  });
});
