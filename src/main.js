let urlInputEl;
let loadMsgEl;

window.addEventListener("DOMContentLoaded", () => {

  urlInputEl = document.querySelector("#url-input");
  loadMsgEl = document.querySelector("#load-msg");

  let url = localStorage.getItem("url");
  if (url !== null) {
    urlInputEl.value = url;
  }

  document.querySelector("#url-form").addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem("url", urlInputEl.value);
    window.location.href = "/graph";
  });
});