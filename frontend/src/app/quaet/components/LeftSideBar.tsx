import {
  Stack,
  Button,
  Box,
  TextField,
  MenuItem,
  Typography,
  Slider,
  Divider,
} from "@mui/material";
import React, { useState, ChangeEvent } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { sendGetRequest } from "../util/api";
import {
  AddChatData,
  ChatCompletionData,
  ContentData,
  ResultInfo,
} from "../types";

const MODELLIST_ENDPOINT = "/get_modellist";

// API Server Interface
interface ModelData {
  name: string;
  llm_service: string;
  deployment_name: string;
  api_key: string;
  api_version: string | null;
  azure_endpoint: string | null;
}
interface ModelListResponseData {
  models: ModelData[];
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

// Component Interface
interface LeftSideBarProps {
  selectedModel: string;
  promptClass: string | null;
  temperature: number;
  contents: ContentData[];
  maxTokens: number;
  chatdata: ChatCompletionData;
  systemContent: string;
  setSelectedModel: (newValue: string) => void;
  setPromptClass: (promptClass: string) => void;
  setTemperature: (newValue: number) => void;
  setContents: React.Dispatch<React.SetStateAction<ContentData[]>>;
  setMaxTokens: (newValue: number) => void;
  setUserTokens: (newValue: number) => void;
  setTotalTokens: (newValue: number) => void;
  setQaId: (newValue: string) => void;
  setRating: (newValue: number) => void;
  setComment: (newValue: string) => void;
  setResultInfo: (newValue: ResultInfo) => void;
  setChatdata: React.Dispatch<React.SetStateAction<ChatCompletionData>>;
}

// LeftSideBar Component
const LeftSideBar: React.FC<LeftSideBarProps> = ({
  selectedModel,
  promptClass,
  temperature,
  contents,
  maxTokens,
  chatdata,
  systemContent,
  setSelectedModel,
  setPromptClass,
  setTemperature,
  setContents,
  setMaxTokens,
  setUserTokens,
  setTotalTokens,
  setQaId,
  setRating,
  setComment,
  setResultInfo,
  setChatdata,
}) => {
  // hooks
  const [getModellistLoading, setGetModellistLoading] =
    useState<boolean>(false);
  const [getModellistError, setGetModellistError] = useState<string>("");
  const [models, setModels] = useState<ModelData[]>([]);

  // handlers
  const handleGetModelList = async () => {
    console.log("handleGetModelList called");
    setGetModellistLoading(true);
    setGetModellistError("");
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + MODELLIST_ENDPOINT;
    try {
      const response = await sendGetRequest<
        ModelListResponseData | ResponseErrorData
      >(url);
      console.log(response.data);
      if ("models" in response.data) {
        setModels(response.data.models);
        setSelectedModel(response.data.models[0].name);
      } else {
        setGetModellistError("Invalid response data");
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message) {
        setGetModellistError(error.message);
      }
    } finally {
      setGetModellistLoading(false);
    }
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedModel(event.target.value);
  };

  const handlePromptClass = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue: string = e.target.value;
    setPromptClass(inputValue);
  };

  const handleTemperatureChange = (
    event: Event,
    newValue: number | number[],
  ) => {
    if (typeof newValue === "number") {
      setTemperature(newValue);
    }
  };

  const handleUpload = (e: React.FormEvent<HTMLInputElement>) => {
    console.log("handleUpload called");

    const target = e.target as HTMLInputElement & {
      files: FileList;
    };
    console.log("target", target.files);
    if (target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const loadText = reader.result?.toString().trim();
        console.log(loadText);
        const newContents = [...contents];
        for (let i = newContents.length - 1; i >= 0; i--) {
          if (newContents[i].type === "user") {
            newContents[i].value = loadText ?? "";
            break;
          }
        }
        setContents(newContents);

        if (chatdata.add_chat_data.length === 0) {
          const newChatdata: ChatCompletionData = {
            system_content: systemContent,
            user_content: loadText ?? "",
            add_chat_data: [],
          };
          setChatdata(newChatdata);
        } else {
          const userContent = chatdata.user_content;
          const newAddChatData: AddChatData[] = [...chatdata.add_chat_data];
          newAddChatData[chatdata.add_chat_data.length - 1].user_content =
            loadText ?? "";
          const newChatData: ChatCompletionData = {
            system_content: systemContent,
            user_content: userContent,
            add_chat_data: newAddChatData,
          };
          setChatdata(newChatData);
        }
      };
      reader.readAsText(target.files[0]);
    }
  };
  const handleMaxTokens = (values: NumberFormatValues) => {
    const numericValue = Number(values.value);
    setMaxTokens(numericValue);
  };
  const handleReset = () => {
    console.log("handleReset called");
    setUserTokens(0);
    setTotalTokens(0);
    const newContent: ContentData[] = [
      {
        type: "user",
        value: "",
        color: "grey.400",
      },
    ];
    setContents(newContent);
    setQaId("");
    setRating(0.0);
    setComment("");
    setResultInfo({
      lines: 0,
      finishReason: "",
      promptTokens: 0,
      completionTokens: 0,
    });
    setChatdata({
      system_content: "",
      user_content: "",
      add_chat_data: [],
    });
    console.log("handleReset return");
  };

  //function
  const valueTemperature = (value: number): string => {
    return value.toString();
  };

  //jsx
  return (
    <Stack>
      <Button onClick={handleGetModelList} sx={{ pt: 3 }}>
        Get Modellist
      </Button>
      <Box>
        <TextField
          label="select model"
          variant="standard"
          select
          fullWidth
          value={selectedModel}
          onChange={handleModelChange}
        >
          {models.map((model) => (
            <MenuItem key={model.name} value={model.name}>
              {model.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {getModellistLoading && <Typography>Loading...</Typography>}
      {getModellistError && (
        <Typography color="error">{getModellistError}</Typography>
      )}
      {!getModellistError && !getModellistLoading && (
        <Typography>&nbsp;</Typography>
      )}
      <Divider sx={{ pt: 1 }} />
      <Typography variant="subtitle1" sx={{ pt: 3 }}>
        Prompt Class
      </Typography>
      <TextField
        onChange={handlePromptClass}
        variant="standard"
        size="small"
        value={promptClass}
        sx={{ p: 1 }}
      />
      <Divider sx={{ pt: 2 }} />
      <Typography variant="subtitle1" sx={{ pt: 3 }}>
        Temperature
      </Typography>
      <Slider
        aria-label="Temperature"
        size="small"
        value={temperature}
        onChange={handleTemperatureChange}
        valueLabelDisplay="auto"
        getAriaValueText={valueTemperature}
        step={0.1}
        min={0.0}
        max={1.0}
        marks={marks}
      />
      <Divider sx={{ pt: 1 }} />
      <Typography variant="subtitle1" sx={{ pt: 3 }}>
        Max Tokens
      </Typography>
      <NumericFormat
        value={maxTokens}
        customInput={TextField}
        thousandSeparator
        variant="standard"
        inputProps={{ style: { textAlign: "right" } }}
        onValueChange={handleMaxTokens}
      />
      <Divider sx={{ pt: 2 }} />
      <Button component="label" sx={{ pt: 3 }}>
        Template File Upload
        <input type="file" hidden onChange={handleUpload} />
      </Button>
      <Divider sx={{ pt: 2 }} />
      <Button onClick={handleReset} sx={{ pt: 3 }}>
        Reset
      </Button>
    </Stack>
  );
};

const marks = [
  {
    value: 0.0,
    label: "0.0",
  },
  {
    value: 0.5,
    label: "0.5",
  },
  {
    value: 1.0,
    label: "1.0",
  },
];

export default LeftSideBar;
