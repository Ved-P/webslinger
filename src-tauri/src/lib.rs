use reqwest::blocking::Client;
use scraper::{Html, Selector};

fn get_html(url: &str) -> Result<String, reqwest::Error> {

    let client = Client::new();
    let response = client.get(url).send()?;
    let html_content = response.text()?;

    Ok(html_content)
}

#[tauri::command]
fn scrape(url: &str) -> String {

    let html_content = get_html(url).expect("Failed to get HTML.");

    let document = Html::parse_document(&html_content);
    let selector = Selector::parse("a").unwrap();

    let mut res = "".to_string();

    for element in document.select(&selector) {
        res += &(element.value().attr("href").unwrap().to_string() + "\n");
    }

    res.to_string()
}

#[tauri::command]
fn inspect() {
    println!("Inspect");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![scrape, inspect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
