export function showToast(msg){
  const toastDiv = document.querySelector("#toast");
  const toastBody = document.querySelector(".toast-body");
  const toast = new bootstrap.Toast(toastDiv);
  toastBody.textContent = msg;
  toast.show();
}