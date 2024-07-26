import traceback
from dataclasses import dataclass
from typing import List, Tuple, Union

import tiktoken  # type: ignore
from flask import current_app


@dataclass
class AddChatData:
    assistant_content: str
    user_content: str


@dataclass
class RequestData:
    system_content: str
    user_content: str
    add_chat_data: List[AddChatData]
    selected_model: str


@dataclass
class ResponseData:
    latest_user_tokens: int
    total_tokens: int


@dataclass
class ResponseErrorData:
    error: str
    detail: str


def count_tokens(
    request_data: RequestData,
) -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- count_tokens called -")
        logger.debug(request_data)

        encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
        latest_user_tokens = 0
        system_content_tokens = len(encoding.encode(request_data.system_content))
        logger.debug(f"system_content tokens: {system_content_tokens}")
        user_content_tokens = len(encoding.encode(request_data.user_content))
        logger.debug(f"user_content tokens: {user_content_tokens}")
        latest_user_tokens = user_content_tokens
        total_assistant_tokens = 0
        total_user_tokens = 0
        logger.debug(type(request_data.add_chat_data))
        for item in request_data.add_chat_data:
            obj = AddChatData(**item)  # type: ignore
            logger.debug(obj.assistant_content)
            logger.debug(obj.user_content)
            assistant_tokens = encoding.encode(obj.assistant_content)
            user_tokens = encoding.encode(obj.user_content)
            total_assistant_tokens = total_assistant_tokens + len(assistant_tokens)
            user_tokens_len = len(user_tokens)
            logger.debug(f"user_tokens_len: {user_tokens_len}")
            total_user_tokens = total_user_tokens + user_tokens_len
            if user_tokens_len:
                latest_user_tokens = len(user_tokens)
        logger.debug(f"total assistant_content tokens: {total_assistant_tokens}")
        logger.debug(f"total user_content tokens: {total_user_tokens}")
        logger.debug(f"latest_user_tokens: {latest_user_tokens}")
        total_tokens = (
            system_content_tokens
            + user_content_tokens
            + total_assistant_tokens
            + total_user_tokens
        )
        logger.debug(f"total tokens: {total_tokens}")

        response_data: ResponseData = ResponseData(
            latest_user_tokens=latest_user_tokens, total_tokens=total_tokens
        )
        logger.debug(response_data)
        logger.debug("- count_tokens return -")
        return response_data, 200

    except Exception as e:
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.error(f"error_response: {error_response}")
        return error_response, 500
