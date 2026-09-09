# from pydantic_settings import BaseSettings


# class Settings(BaseSettings):

#     DATABASE_URL: str
#     OLLAMA_URL: str = "http://localhost:11434"
#     OLLAMA_MODEL: str = "llama3.2"

#     UPLOAD_DIR: str = "data/uploads"
#     VECTOR_STORE_PATH: str = "data/faiss_index"

#     class Config:
#         env_file = ".env"


# settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str

    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    UPLOAD_DIR: str = "data/uploads"
    VECTOR_STORE_PATH: str = "data/faiss_index"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()

