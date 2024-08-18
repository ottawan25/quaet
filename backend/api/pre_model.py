import os
from dataclasses import dataclass, field
from typing import List, Optional

import toml
from dotenv import load_dotenv


@dataclass
class ModelDef:
    name: str
    llm_service: str
    deployment_name: str
    api_key: str
    api_version: Optional[str] = None
    azure_endpoint: Optional[str] = None

    def __post_init__(self):
        if self.llm_service == "Azure":
            if not self.api_version:
                raise ValueError("api_version is required")
            if not self.azure_endpoint:
                raise ValueError("azure_endpoint is required")


@dataclass
class PreModel:
    models: List[ModelDef] = field(default_factory=list)

    def __post_init__(self):
        load_dotenv()
        def_file = os.environ.get("PRE_DEF_MODEL")
        if def_file is None:
            raise Exception("PRE_DEF_MODEL not defined")
        self.load_from_toml(def_file)

    def load_from_toml(self, file_path: str) -> None:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"{file_path} dose not exist.")
        data = toml.load(file_path)
        model_data_list = data.get("model", [])

        for model_data in model_data_list:
            missing_fields = [
                field
                for field in ["name", "llm_service", "deployment_name", "api_key"]
                if field not in model_data
            ]
            if missing_fields:
                raise ValueError(
                    f"Missing required fields in model definition : {', '.join(missing_fields)}"
                )
            self.models.append(ModelDef(**model_data))

    def get_def(self, model_name: str, key: Optional[str] = None) -> Optional[ModelDef]:
        for model in self.models:
            if model.name == model_name:
                return model
        return None

    def get_list(self) -> List[ModelDef]:
        return self.models
