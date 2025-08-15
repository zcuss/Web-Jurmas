document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");

  // Ambil semua tombol toggle dropdown
  const toggles = sidebar.querySelectorAll('[data-bs-toggle="collapse"]');

  toggles.forEach((toggle) => {
    const targetSelector = toggle.getAttribute("href");
    const target = document.querySelector(targetSelector);
    const icon = toggle.querySelector(".toggle-icon");

    const bsCollapse = new bootstrap.Collapse(target, {
      toggle: false,
    });

    toggle.addEventListener("click", (e) => {
      e.preventDefault();

      // Tutup semua menu lain
      sidebar.querySelectorAll(".collapse.show").forEach((openCollapse) => {
        if (openCollapse !== target) {
          new bootstrap.Collapse(openCollapse, { toggle: false }).hide();
          const openToggle = openCollapse.previousElementSibling;
          const openIcon = openToggle?.querySelector(".toggle-icon");
          if (openIcon) {
            openIcon.classList.remove("fa-chevron-up");
            openIcon.classList.add("fa-chevron-down");
          }
        }
      });

      // Toggle menu sekarang
      if (target.classList.contains("show")) {
        bsCollapse.hide();
        icon?.classList.remove("fa-chevron-up");
        icon?.classList.add("fa-chevron-down");
      } else {
        bsCollapse.show();
        icon?.classList.remove("fa-chevron-down");
        icon?.classList.add("fa-chevron-up");
      }
    });
  });

  // Klik di luar sidebar → tutup semua collapse
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target)) {
      sidebar.querySelectorAll(".collapse.show").forEach((collapseEl) => {
        new bootstrap.Collapse(collapseEl, { toggle: false }).hide();
        const icon = collapseEl.previousElementSibling.querySelector(".toggle-icon");
        if (icon) {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      });
    }
  });
});
