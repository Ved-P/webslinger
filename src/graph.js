const { invoke } = window.__TAURI__.core;
// import { fetch } from '@tauri-apps/api/http'

let backButton;

async function scrape() {
  let stuff = await invoke("scrape", { url: localStorage.getItem("url") });
}

window.addEventListener("DOMContentLoaded", () => {

  backButton = document.querySelector("#back");

  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/index";
  });

  scrape();
});