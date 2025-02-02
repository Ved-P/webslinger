const { invoke } = window.__TAURI__.core;
// import { fetch } from '@tauri-apps/api/http'

let backButton;
let loadCard;
let graphCard;

let pages;
let explanation_count = 0;

const MAX_SCAN_DEPTH = 20;

async function component(page) {
  let res = "";
  if (Object.keys(pages[page]).length != 0) {
    res += "<div class='page'>";
    res += "<p class='page-name'>";
    res += page;
    res += "</p>";
    res += "<p class='checkmark'>&#x2714;</p>";
    res += "</div><hr>";
  } else {
    res += `<div class='page' id='page-${explanation_count}'>`;
    res += "<p class='page-name'>";
    res += page;
    res += "</p>";
    res += `<p class='alert' id='alert-${explanation_count}'>&#x26A0;</p>`;
    res += "</div>";
    res += `<div class='explanation muted' id='explanation-${explanation_count}'>Vulnerabilities will go here.</div>`;
    res += "<hr>";
    explanation_count++;
  }
  return res;
}

async function generate() {
  let url = localStorage.getItem("url")
  if (url.indexOf("https://") != 0 || url.indexOf("http://") != 0)
    url = "https://" + url;

  let pages_json = await invoke("scrape", { url: url });
  pages = JSON.parse(pages_json);

  let pagesHTML = "";

  for (let page in pages) {
    pagesHTML += await component(page);
  }

  if (Object.keys(pages).length >= MAX_SCAN_DEPTH) {
    pagesHTML += "<p class='muted'>Maximum scan depth exceeded.</p>";
  }

  graphCard.innerHTML = pagesHTML;

  for (let i = 0; i < explanation_count; i++) {
    const pageElement = document.querySelector(`#page-${i}`);
    if (pageElement) {
      pageElement.addEventListener('click', (e) => inspect(e, i));
    }
  }

  loadCard.style.display = "none";
  graphCard.style.display = "block";
}

window.addEventListener("DOMContentLoaded", () => {

  backButton = document.querySelector("#back");
  loadCard = document.querySelector("main");
  graphCard = document.querySelector("#graph");

  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/index";
  });

  generate();
});

function inspect(e, id) {
  e.preventDefault();
  for (let i = 0; i < explanation_count; i++) {
    document.getElementById("explanation-" + i).style.display = "none";
  }
  document.getElementById("explanation-" + id).style.display = "block";
}