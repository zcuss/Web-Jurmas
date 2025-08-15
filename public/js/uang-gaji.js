const modal = document.getElementById("modal");
const modalAdminName = document.getElementById("modal-admin-name");
const setorForm = document.getElementById("setorForm");

function openModal(admin) {
  modal.style.display = "block";
  modalAdminName.textContent = admin.charAt(0).toUpperCase() + admin.slice(1);
  setorForm.action = `/uang-gaji/${encodeURIComponent(admin)}`;
}

function closeModal() {
  modal.style.display = "none";
  setorForm.reset();
}

window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};
