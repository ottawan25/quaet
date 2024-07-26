import os
import traceback
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Tuple, Union
from unittest.mock import MagicMock

import toml
from dotenv import load_dotenv
from flask import current_app
from openai import AzureOpenAI, OpenAI
from openai.types.chat import (
    ChatCompletion,
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
)

from pre_model import PreModel
from pre_openai_mock import get_response

QA_LOGFILE_EXTENSION = ".toml"


@dataclass
class RequestData:
    system_content: str
    user_content: str
    temperature: float
    prompt_class: str
    user_id: str
    selected_model: str


@dataclass
class ResponseData:
    finish_reason: str
    content: str | None
    completion_tokens: int
    prompt_tokens: int
    qa_id: str
    lines: int
    prompt_class: str
    temperature: float


@dataclass
class ResponseErrorData:
    error: str
    detail: str


def get_current_datetime() -> str:
    now = datetime.now()
    formatted_datetime = now.strftime("%Y%m%d_%H%M%S")
    return formatted_datetime


def chat_completion(
    request_data: RequestData,
) -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- chat_completion called -")
        logger.debug(request_data)
        logger.debug(type(request_data))

        load_dotenv()

        pre_model = PreModel()
        logger.debug(f"selected_model: {request_data.selected_model}")
        model_def = pre_model.get_def(request_data.selected_model)
        if model_def is None or model_def.api_key is None:
            raise Exception("api_key not defined")

        api_key = os.environ.get(model_def.api_key)

        client: Union[AzureOpenAI, OpenAI]
        if model_def.llm_service == "Azure":
            logger.debug("llm_service: Azure")
            if model_def.azure_endpoint is None:
                raise Exception("azure_endpoint is None")
            client = AzureOpenAI(
                api_key=api_key,
                api_version=model_def.api_version,
                azure_endpoint=model_def.azure_endpoint,
            )
        elif model_def.llm_service == "OpenAI":
            logger.debug("llm_service: OpenAI")
            client = OpenAI(api_key=api_key)
        else:
            raise Exception("invalid llm_service")

        deployment_name = model_def.deployment_name

        current_datetime = get_current_datetime()
        qa_id = current_datetime + "_" + request_data.user_id
        logger.debug(f"qa_id: {qa_id}")

        lines = len(request_data.user_content.split("\n"))
        logger.debug(f"Number of lines: {lines}")

        logger.debug(request_data.user_content)

        messages: list[ChatCompletionMessageParam] = [
            ChatCompletionSystemMessageParam(
                role="system", content=f"{request_data.system_content}"
            ),
            ChatCompletionUserMessageParam(
                role="user", content=f"{request_data.user_content}"
            ),
        ]

        runmode = os.environ.get("PRE_RUNMODE")
        response: Union[MagicMock, ChatCompletion]
        if runmode == "Mock":
            logger.debug("--OpenAI API Mocking--")
            loadfile = os.environ.get("PRE_MOCKDATA_FILE")
            if loadfile is None:
                raise Exception("PRE_MOCKDATA_FILE not defined")
            response = get_response(loadfile)
        else:
            logger.debug("--OpenAI API Call--")
            response = client.chat.completions.create(
                model=deployment_name,
                messages=messages,
                temperature=request_data.temperature,
            )
            logger.debug(type(response))
            response_json = response.model_dump_json(indent=2)
            logger.debug(response_json)

        if response.usage is not None:
            completion_tokens = response.usage.completion_tokens
            prompt_tokens = response.usage.prompt_tokens
        else:
            completion_tokens = 0
            prompt_tokens = 0

        response_data: ResponseData = ResponseData(
            finish_reason=response.choices[0].finish_reason,
            content=response.choices[0].message.content,
            completion_tokens=completion_tokens,
            prompt_tokens=prompt_tokens,
            qa_id=qa_id,
            lines=lines,
            prompt_class=request_data.prompt_class,
            temperature=request_data.temperature,
        )

        # qa_log
        request_data_dict = asdict(request_data)
        logger.debug(request_data_dict)
        qa_log_dir = os.environ.get("PRE_QA_LOG_DIR")
        if qa_log_dir is None:
            raise Exception("PRE_QA_LOG_DIR is not set.")
        logger.debug(qa_log_dir)
        logfile = qa_log_dir + qa_id + QA_LOGFILE_EXTENSION
        chat_completion_request = {
            "model": deployment_name,
            "messages": messages,
            "temperature": request_data.temperature,
            "prompt_class": request_data.prompt_class,
        }
        request_qa_log = {"qa_request": chat_completion_request}
        chat_completion_response = {
            "finish_reason": response.choices[0].finish_reason,
            "content": response.choices[0].message.content,
            "completion_tokens": completion_tokens,
            "prompt_tokens": prompt_tokens,
        }
        response_qa_log = {"qa_response": chat_completion_response}
        with open(logfile, "w") as f:
            toml.dump(request_qa_log, f)
            toml.dump(response_qa_log, f)

        logger.debug(response_data)
        logger.debug("- chat_completion return -")
        return response_data, 200

    except Exception as e:
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.error(f"error_response: {error_response}")
        return error_response, 500
