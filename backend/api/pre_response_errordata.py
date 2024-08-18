from dataclasses import dataclass


@dataclass
class ResponseErrorData:
    error: str
    detail: str
