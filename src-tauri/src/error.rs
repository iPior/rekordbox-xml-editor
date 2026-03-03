use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("XML parse error: {0}")]
    XmlParse(String),
    #[error("Validation failed: {0}")]
    Validation(String),
}

pub type AppResult<T> = Result<T, AppError>;
