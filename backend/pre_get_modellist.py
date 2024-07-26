import traceback
from dataclasses import dataclass
from typing import List, Tuple, Union

from flask import current_app

from pre_model import ModelDef, PreModel


@dataclass
class ResponseData:
    models: List[ModelDef]


@dataclass
class ResponseErrorData:
    error: str
    detail: str


def get_modellist() -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- get_model called -")

        pre_model = PreModel()
        models = pre_model.get_list()

        response_data: ResponseData = ResponseData(models=models)
        logger.debug(f"response_data : {response_data}")
        logger.debug("- get_model return -")
        return response_data, 200

    except Exception as e:
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.error(f"error_response: {error_response}")
        return error_response, 500
