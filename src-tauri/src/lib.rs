use reqwest::blocking::{Client, get};
use reqwest::header::CONTENT_TYPE;
use scraper::{Html, Selector};
use serde_json;
use std::collections::HashMap;
use url::Url;

const MAX_SCAN_DEPTH: usize = 20;

fn is_html(url: &str) -> bool {
    match get(url) {
        Ok(response) => {
            if !response.status().is_success() {
                return false;
            }
            if let Some(content_type) = response.headers().get(CONTENT_TYPE) {
                if content_type.to_str().unwrap_or("").contains("text/html") {
                    return true;
                }
            }
            false
        }
        Err(_) => false,
    }
}

fn get_html(url: &str) -> Result<String, reqwest::Error> {

    let client = Client::new();
    let response = client.get(url).send()?;
    let html_content = response.text()?;

    Ok(html_content)
}

#[tauri::command]
fn scrape(url: &str) -> String {

    let selector = Selector::parse("a").unwrap();

    let domain = Url::parse(url).expect("URL failure.");

    let mut pages: HashMap<String, HashMap<String, i32>> = HashMap::new();
    let mut stack = vec![domain.path().to_string()];

    while let Some(curr_url) = stack.pop() {

        if pages.len() >= MAX_SCAN_DEPTH {
            break;
        }

        if pages.contains_key(&curr_url) {
            continue;
        }

        pages.insert(curr_url.clone(), HashMap::new());

        let html_content = match get_html(&domain.join(&curr_url).unwrap().to_string()) {
            Ok(content) => content,
            Err(_) => continue,
        };

        let document = Html::parse_document(&html_content);
        
        for element in document.select(&selector) {
            let link = element.value().attr("href").unwrap();

            let full_link = if let Ok(resolved_url) = domain.join(&link) {
                resolved_url.to_string()
            } else {
                link.to_string()
            };

            let relative_link = domain.join(&full_link).unwrap().path().to_string();

            if !pages.contains_key(&relative_link)
            && !stack.contains(&relative_link)
            && (relative_link.ends_with(".html") || is_html(&full_link)) {
                stack.push(relative_link);
            }
        }
    }

    serde_json::to_string(&pages).unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![scrape])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
