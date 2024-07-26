import os
import traceback
from dataclasses import dataclass
from datetime import datetime
from typing import List, Tuple, Union
from unittest.mock import MagicMock

import toml
from dotenv import load_dotenv
from flask import current_app
from openai import AzureOpenAI, OpenAI
from openai.types.chat import (
    ChatCompletion,
    ChatCompletionAssistantMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
)

from pre_model import PreModel
from pre_openai_mock import get_response

QA_LOGFILE_EXTENSION = ".toml"


@dataclass
class AddChatData:
    assistant_content: str
    user_content: str


@dataclass
class RequestData:
    user_id: str
    qa_id: str
    system_content: str
    user_content: str
    add_chat_data: List[AddChatData]
    selected_model: str
    prompt_class: str
    temperature: float
    max_tokens: int


@dataclass
class ResponseData:
    qa_id: str
    finish_reason: str
    assistant_content: str | None
    completion_tokens: int
    prompt_tokens: int
    lines: int
    prompt_class: str
    temperature: float
    model: str


@dataclass
class ResponseErrorData:
    error: str
    detail: str


def get_current_datetime() -> str:
    now = datetime.now()
    formatted_datetime = now.strftime("%Y%m%d_%H%M%S")
    return formatted_datetime


def multiturn_completion(
    request_data: RequestData,
) -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- multiturn_completion called -")
        logger.debug(f"-- [011] request_data : {request_data}")

        load_dotenv()

        # ----- Initialize -----
        pre_model = PreModel()
        model_def = pre_model.get_def(request_data.selected_model)
        if model_def is None or model_def.api_key is None:
            raise Exception("api_key not defined")

        api_key = os.environ.get(model_def.api_key)

        client: Union[AzureOpenAI, OpenAI]
        if model_def.llm_service == "Azure":
            logger.debug("-- [021] llm_service : Azure")
            if model_def.azure_endpoint is None:
                raise Exception("azure_endpoint is None")
            client = AzureOpenAI(
                api_key=api_key,
                api_version=model_def.api_version,
                azure_endpoint=model_def.azure_endpoint,
            )
        elif model_def.llm_service == "OpenAI":
            logger.debug("-- [022] llm_service : OpenAI")
            client = OpenAI(api_key=api_key)
        else:
            raise Exception("invalid llm_service")

        deployment_name = model_def.deployment_name

        # ----- Setup -----
        current_datetime = get_current_datetime()
        if request_data.qa_id == "":
            qa_id = current_datetime + "_01_" + request_data.user_id
            logger.debug(f"-- [111] qa_id: {qa_id}")
        else:
            date_time = request_data.qa_id[0:15]
            branch = request_data.qa_id[16:18]
            branch_int = int(branch)
            branch_int = branch_int + 1
            branch_str = format(branch_int, "#02d")
            qa_id = date_time + "_" + branch_str + "_" + request_data.user_id
            logger.debug(f"-- [112] qa_id: {qa_id}")

        lines = len(request_data.user_content.split("\n"))
        logger.debug(f"-- [121] lines: {lines}")

        messages: List[ChatCompletionMessageParam] = [
            ChatCompletionSystemMessageParam(
                role="system", content=f"{request_data.system_content}"
            ),
            ChatCompletionUserMessageParam(
                role="user", content=f"{request_data.user_content}"
            ),
        ]
        for item in request_data.add_chat_data:
            obj = AddChatData(**item)  # type: ignore
            messages.append(
                ChatCompletionAssistantMessageParam(
                    role="assistant", content=f"{obj.assistant_content}"
                )
            )
            messages.append(
                ChatCompletionUserMessageParam(
                    role="user", content=f"{obj.user_content}"
                )
            )

        logger.debug(f"messages: {messages}")

        # ----- Request / Response -----
        runmode = os.environ.get("PRE_RUNMODE")
        response: Union[MagicMock, ChatCompletion]
        if runmode == "Mock":
            logger.debug("-- [211] Mock mode")
            loadfile = os.environ.get("PRE_MOCKDATA_FILE")
            if loadfile is None:
                raise Exception("PRE_MOCKDATA_FILE not defined")
            response = get_response(loadfile)
        else:
            logger.debug("-- [221] Real mode")
            logger.debug("-- [231] client.chat.completions.create()")
            logger.debug(f"model: {deployment_name}")
            logger.debug(f"messages: {messages}")
            logger.debug(f"temperature: {request_data.temperature}")
            logger.debug(f"max_tokens: {request_data.max_tokens}")
            response = client.chat.completions.create(
                model=deployment_name,
                messages=messages,
                temperature=request_data.temperature,
                max_tokens=request_data.max_tokens,
            )
            response_json = response.model_dump_json(indent=2)
            logger.debug("-- [241] response (json format)")
            logger.debug(response_json)

        if response.usage is not None:
            completion_tokens = response.usage.completion_tokens
            prompt_tokens = response.usage.prompt_tokens
            total_tokens = response.usage.total_tokens
        else:
            completion_tokens = 0
            prompt_tokens = 0
            total_tokens = 0

        # ----- Recording -----
        response_data: ResponseData = ResponseData(
            finish_reason=response.choices[0].finish_reason,
            assistant_content=response.choices[0].message.content,
            completion_tokens=completion_tokens,
            prompt_tokens=prompt_tokens,
            qa_id=qa_id,
            lines=lines,
            prompt_class=request_data.prompt_class,
            temperature=request_data.temperature,
            model=response.model,
        )

        qa_log_dir = os.environ.get("PRE_QA_LOG_DIR")
        if qa_log_dir is None:
            raise Exception("PRE_QA_LOG_DIR is not set.")
        logger.debug(f"-- [311] qa_log_dir: {qa_log_dir}")
        logfile = qa_log_dir + qa_id + QA_LOGFILE_EXTENSION
        chat_completion_request = {
            "qa_id": qa_id,
            "current_datetime": current_datetime,
            "deployment_name": deployment_name,
            "messages": messages,
            "temperature": request_data.temperature,
            "max_tokens": request_data.max_tokens,
            "prompt_class": request_data.prompt_class,
        }
        request_qa_log = {"qa_request": chat_completion_request}
        chat_completion_response = {
            "finish_reason": response.choices[0].finish_reason,
            "created": response.created,
            "model": response.model,
            "content": response.choices[0].message.content,
            "completion_tokens": completion_tokens,
            "prompt_tokens": prompt_tokens,
            "total_tokens": total_tokens,
        }
        response_qa_log = {"qa_response": chat_completion_response}
        with open(logfile, "w") as f:
            toml.dump(request_qa_log, f)
            toml.dump(response_qa_log, f)

        # ----- Terminate -----
        logger.debug(f"-- [411] response_data: {response_data}")
        logger.debug("- multiturn_completion return -")
        return response_data, 200

    except Exception as e:
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.error(f"error_response: {error_response}")
        return error_response, 500
