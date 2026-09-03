from pydantic import BaseModel


class QuestionRequest(BaseModel):

    question: str


class ChatResponse(BaseModel):

    answer: str

    sources: list[str]