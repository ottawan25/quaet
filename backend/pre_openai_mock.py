import json
from unittest.mock import MagicMock

from flask import current_app
from openai.types.chat import (
    ChatCompletion,
)


def get_response(
    loadfile: str,
) -> ChatCompletion:
    logger = current_app.logger
    logger.debug("-- pre_openai_mock get_response called --")
    logger.debug(f"   loadfile: {loadfile}")

    response = MagicMock()
    with open(loadfile) as file:
        try:
            res_mockdata = file.read()
        except Exception:
            pass

    res_mockdata_json = json.loads(res_mockdata)

    response.id = res_mockdata_json["id"]
    logger.debug(f"   id: {response.id}")
    response.choices[0].finish_reason = res_mockdata_json["choices"][0]["finish_reason"]
    logger.debug(f"   choices[0].finish_reason: {response.choices[0].finish_reason}")
    response.choices[0].index = res_mockdata_json["choices"][0]["index"]
    logger.debug(f"   choices[0].index: {response.choices[0].index}")
    response.choices[0].logprobs = res_mockdata_json["choices"][0]["logprobs"]
    logger.debug(f"   choices[0].logprobs: {response.choices[0].logprobs}")
    response.choices[0].message.content = res_mockdata_json["choices"][0]["message"][
        "content"
    ]
    logger.debug(
        f"   choices[0].message.content: {response.choices[0].message.content}"
    )
    response.choices[0].message.role = res_mockdata_json["choices"][0]["message"][
        "role"
    ]
    logger.debug(f"   choices[0].message.role: {response.choices[0].message.role}")
    response.choices[0].message.function_call = res_mockdata_json["choices"][0][
        "message"
    ]["function_call"]
    logger.debug(
        f"   choices[0].message.function_call: {response.choices[0].message.function_call}"
    )
    response.choices[0].message.tool_calls = res_mockdata_json["choices"][0]["message"][
        "tool_calls"
    ]
    logger.debug(
        f"   choices[0].message.tool_calls: {response.choices[0].message.tool_calls}"
    )

    response.created = res_mockdata_json["created"]
    logger.debug(f"   created: {response.created}")
    response.model = res_mockdata_json["model"]
    logger.debug(f"   model: {response.model}")
    response.object = res_mockdata_json["object"]
    logger.debug(f"   object: {response.object}")
    response.system_fingerprint = res_mockdata_json["system_fingerprint"]
    logger.debug(f"   system_fingerprint: {response.system_fingerprint}")
    response.usage.completion_tokens = res_mockdata_json["usage"]["completion_tokens"]
    logger.debug(f"   usage.completion_tokens: {response.usage.completion_tokens}")
    response.usage.prompt_tokens = res_mockdata_json["usage"]["prompt_tokens"]
    logger.debug(f"   usage.prompt_tokens: {response.usage.prompt_tokens}")
    response.usage.total_tokens = res_mockdata_json["usage"]["total_tokens"]
    logger.debug(f"   usage.total_tokens: {response.usage.total_tokens}")
    logger.debug("-- pre_openai_mock get_response return --")
    return response
