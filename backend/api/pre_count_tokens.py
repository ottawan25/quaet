import traceback
from dataclasses import dataclass
from typing import List, Tuple, Union

import google.generativeai as genai  # type: ignore
import tiktoken  # type: ignore
from flask import current_app
from pre_model import PreModel
from vertexai.generative_models import GenerativeModel  # type: ignore


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

        # --- Initialize ---
        pre_model = PreModel()
        model_def = pre_model.get_def(request_data.selected_model)
        if model_def is None or model_def.api_key is None:
            raise Exception("api_key not defined")

        # --- Count Tokens ---
        if model_def.llm_service == "OpenAI" or model_def.llm_service == "Azure":
            encoding = tiktoken.encoding_for_model(model_def.deployment_name)

            system_content_tokens = len(encoding.encode(request_data.system_content))
            logger.debug(f"-- [101] system_content tokens: {system_content_tokens}")

            user_content_tokens = len(encoding.encode(request_data.user_content))
            logger.debug(f"-- [111] user_content tokens: {user_content_tokens}")
            latest_user_tokens = user_content_tokens

            total_assistant_tokens = 0
            total_user_tokens = 0
            for item in request_data.add_chat_data:
                obj = AddChatData(**item)  # type: ignore

                assistant_tokens = encoding.encode(obj.assistant_content)
                assistant_tokens_len = len(assistant_tokens)
                logger.debug(f"-- [121] assistant_tokens_len: {assistant_tokens_len}")
                total_assistant_tokens = total_assistant_tokens + assistant_tokens_len

                if obj.user_content:
                    user_tokens = encoding.encode(obj.user_content)
                    user_tokens_len = len(user_tokens)
                    logger.debug(f"-- [131] user_tokens_len: {user_tokens_len}")
                    total_user_tokens = total_user_tokens + user_tokens_len
                    latest_user_tokens = len(user_tokens)

            logger.debug(
                f"-- [141] total assistant_content tokens: {total_assistant_tokens}"
            )
            logger.debug(f"-- [151] total user_content tokens: {total_user_tokens}")
            logger.debug(f"-- [161] latest_user_tokens: {latest_user_tokens}")
            total_tokens = (
                system_content_tokens
                + user_content_tokens
                + total_assistant_tokens
                + total_user_tokens
            )
            logger.debug(f"-- [171] total tokens: {total_tokens}")

        elif model_def.llm_service == "GoogleAI" or model_def.llm_service == "VertexAI":
            if model_def.llm_service == "GoogleAI":
                model = genai.GenerativeModel(model_name=model_def.deployment_name)
            elif model_def.llm_service == "VertexAI":
                model = GenerativeModel(
                    model_name=model_def.deployment_name,
                    system_instruction=request_data.system_content,
                )

            genai_system_tokens_obj = model.count_tokens(request_data.system_content)
            genai_system_tokens = genai_system_tokens_obj.total_tokens
            logger.debug(f"-- [201] genai_system_tokens: {genai_system_tokens}")

            genai_user_tokens_obj = model.count_tokens(request_data.user_content)
            genai_user_tokens = genai_user_tokens_obj.total_tokens
            logger.debug(f"-- [211] genai_user_tokens: {genai_user_tokens}")
            latest_user_tokens = genai_user_tokens

            total_genai_assistant_tokens = 0
            total_genai_user_add_tokens = 0
            for item in request_data.add_chat_data:
                obj = AddChatData(**item)  # type: ignore

                genai_assistant_tokens_obj = model.count_tokens(obj.assistant_content)
                genai_assistant_tokens = genai_assistant_tokens_obj.total_tokens
                logger.debug(
                    f"-- [221] genai_assistant_tokens: {genai_assistant_tokens}"
                )
                total_genai_assistant_tokens = (
                    total_genai_assistant_tokens + genai_assistant_tokens
                )

                if obj.user_content:
                    genai_user_add_tokens_obj = model.count_tokens(obj.user_content)
                    genai_user_add_tokens = genai_user_add_tokens_obj.total_tokens
                    logger.debug(
                        f"-- [231] genai_user_add_tokens: {genai_user_add_tokens}"
                    )
                    latest_user_tokens = genai_user_add_tokens
                    total_genai_user_add_tokens = (
                        total_genai_user_add_tokens + genai_user_add_tokens
                    )

            logger.debug(
                f"-- [241] total_genai_assistant_tokens: {total_genai_assistant_tokens}"
            )
            logger.debug(
                f"-- [251] total_genai_user_add_tokens: {total_genai_user_add_tokens}"
            )
            logger.debug(f"-- [261] latest_user_tokens: {latest_user_tokens}")
            total_tokens = (
                genai_system_tokens
                + genai_user_tokens
                + total_genai_assistant_tokens
                + total_genai_user_add_tokens
            )
            logger.debug(f"-- [271] total tokens: {total_tokens}")

        # --- Terminate ---
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
