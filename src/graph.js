const { invoke } = window.__TAURI__.core;
// import { fetch } from '@tauri-apps/api/http'

let backButton;
let loadCard;
let graphCard;

async function generate_graph() {
  let html_content = await invoke("scrape", { url: localStorage.getItem("url") });

  loadCard.style.display = "none";
  graphCard.style.display = "default";

  graphCard.innerHTML = html_content;
  console.log(html_content);
}

window.addEventListener("DOMContentLoaded", () => {

  backButton = document.querySelector("#back");
  loadCard = document.querySelector("main");
  graphCard = document.querySelector("#graph");

  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/index";
  });

  generate_graph();
});