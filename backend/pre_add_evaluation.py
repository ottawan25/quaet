import os
import traceback
from dataclasses import dataclass
from typing import Optional, Tuple, Union

from dotenv import load_dotenv
from flask import current_app
from sqlalchemy import inspect

from pre_evaluation import Evaluation
from pre_get_session import get_session
from pre_response_errordata import ResponseErrorData


class EnvironmentVariableNotSetError(Exception):
    pass


class TableNotFoundError(Exception):
    pass


@dataclass
class RequestData:
    qa_id: str
    lines: int
    prompt_class: str
    temperature: float
    completion_tokens: int
    prompt_tokens: int
    rating: float
    comment: str
    deployment_name: str
    model: str


@dataclass
class ResponseData:
    result: str


def add_evaluation(
    request_data: RequestData,
) -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- add_evaluation called -")
        logger.debug(request_data)

        load_dotenv()
        db_uri: Optional[str] = os.environ.get("PRE_DB_URI")
        if db_uri is None:
            raise EnvironmentVariableNotSetError(
                "Environment variable PRE_DB_URI is not set."
            )

        session = get_session(db_uri)
        logger.debug(session)

        if session.bind is None:
            raise TableNotFoundError("Session bind is None.")

        inspector = inspect(session.bind)
        if not inspector.has_table(Evaluation.__tablename__):
            raise TableNotFoundError("Database or table does not exist.")

        evaluation = Evaluation(
            qa_id=request_data.qa_id,
            lines=request_data.lines,
            prompt_class=request_data.prompt_class,
            temperature=request_data.temperature,
            completion_tokens=request_data.completion_tokens,
            prompt_tokens=request_data.prompt_tokens,
            rating=request_data.rating,
            comment=request_data.comment,
            deployment_name=request_data.deployment_name,
            model=request_data.model,
        )
        session.add(evaluation)
        session.commit()

        response_data: ResponseData = ResponseData(result="success")
        logger.debug(response_data)
        logger.debug("- add_evaluation return -")
        return response_data, 201

    except TableNotFoundError as e:
        if session:
            session.rollback()
        logger.debug(e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=str(e))
        logger.debug(f"error_response: {error_response}")
        return error_response, 500

    except Exception as e:
        if session:
            session.rollback()
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.error(f"error_response: {error_response}")
        return error_response, 500

    finally:
        if session:
            session.close()
