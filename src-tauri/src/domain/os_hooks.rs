use crate::domain::models::DeepLinkRegistration;

pub fn get_opened_urls() -> Vec<String> {
    Vec::new()
}

pub fn register_deep_links() -> DeepLinkRegistration {
    DeepLinkRegistration {
        schemes: vec!["nekoscope".to_string()],
        cold_start_urls: Vec::new(),
    }
}
