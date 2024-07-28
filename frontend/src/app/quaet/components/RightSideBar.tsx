import {
  Stack,
  Typography,
  Slider,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import React, { useState, ChangeEvent } from "react";
import { ResultInfo, ContentData } from "../types";
import { sendPostRequest } from "../util/api";

const ADD_EVALUATION_ENDPOINT = "/add_evaluation";
const SUCCESS_MESSAGE = "Added Successfully";
const MESSAGE_TIMEOUT = 5000;

// API Server Interface
interface AddEvaluationRequestData {
  qa_id: string;
  lines: number;
  prompt_class: string;
  temperature: number;
  completion_tokens: number;
  prompt_tokens: number;
  rating: number;
  comment: string;
  deployment_name: string;
  model: string;
}
interface AddEvaluationResponseData {
  result: string;
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

// Component Interface
interface RightSideBarProps {
  qaId: string;
  resultInfo: ResultInfo;
  promptClass: string;
  temperature: number;
  rating: number;
  comment: string;
  selectedModel: string;
  model: string;
  contents: ContentData[];
  setRating: (newValue: number) => void;
  setComment: (newValue: string) => void;
  setContents: React.Dispatch<React.SetStateAction<ContentData[]>>;
}

// RightSideBar Component
const RightSideBar: React.FC<RightSideBarProps> = ({
  qaId,
  resultInfo,
  promptClass,
  temperature,
  rating,
  comment,
  selectedModel,
  model,
  contents,
  setRating,
  setComment,
  setContents,
}) => {
  // hooks
  const [resultMessage, setResultMessage] = useState<string>("\u00a0");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const reasonColor =
    resultInfo.finishReason !== "stop" ? "warning.main" : "inherit";

  // functions
  const valueRank = (value: number): string => {
    return value.toString();
  };

  // handlers
  const handleRatingChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      console.log(newValue);
      setRating(newValue);
    }
  };
  const handleComment = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("handleComment called");
    const inputValue: string = e.target.value;
    console.log(inputValue);
    setComment(inputValue);
  };
  const handleAddEvaluation = async () => {
    console.log("handleAddEvaluation called");
    setLoading(true);
    setError("");
    const requestData: AddEvaluationRequestData = {
      qa_id: qaId,
      lines: resultInfo.lines,
      prompt_class: promptClass,
      temperature: temperature,
      completion_tokens: resultInfo.completionTokens,
      prompt_tokens: resultInfo.promptTokens,
      rating: rating,
      comment: comment,
      deployment_name: selectedModel,
      model: model,
    };
    const url =
      process.env.NEXT_PUBLIC_API_SERVER_URL + ADD_EVALUATION_ENDPOINT;
    try {
      const response = await sendPostRequest<
        AddEvaluationRequestData,
        AddEvaluationResponseData | ResponseErrorData
      >(url, requestData);
      console.log(response.data);
      if ("result" in response.data) {
        setError("");
        setLoading(false);
        setResultMessage(SUCCESS_MESSAGE);
        setTimeout(() => {
          setResultMessage("\u00a0");
        }, MESSAGE_TIMEOUT);

        const newContents = [...contents];
        for (let i = newContents.length - 1; i >= 0; i--) {
          if (newContents[i].type === "user") {
            if (rating === 3.0) {
              newContents[i].color = "#90d7f1";
            } else if (rating === 2.5) {
              newContents[i].color = "#6ed9d0";
            } else if (rating === 2.0) {
              newContents[i].color = "#77d5a6";
            } else if (rating === 1.5) {
              newContents[i].color = "#98cc7c";
            } else if (rating === 1.0) {
              newContents[i].color = "#bdbd61";
            } else if (rating === 0.5) {
              newContents[i].color = "#dbac5b";
            } else {
              newContents[i].color = "#ef9a6a";
            }
            break;
          }
        }
        setContents(newContents);
      } else {
        const errorData = response.data as ResponseErrorData;
        setError(errorData.detail);
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // jsx
  return (
    <Stack>
      <Typography variant="subtitle1" sx={{ pt: 3 }}>
        QA-ID:
      </Typography>
      {qaId == "" && <Typography>&nbsp;</Typography>}
      <Typography>{qaId}</Typography>
      <Divider sx={{ pt: 2 }} />
      <Typography variant="subtitle1" sx={{ pt: 1 }}>
        Rating
      </Typography>
      <Slider
        aria-label="Rating"
        size="small"
        value={rating}
        onChange={handleRatingChange}
        valueLabelDisplay="auto"
        getAriaValueText={valueRank}
        step={0.5}
        min={0.0}
        max={3.0}
        marks={marks}
      />
      <Typography variant="subtitle1" sx={{ pt: 1 }}>
        Comments
      </Typography>
      <TextField
        size="small"
        fullWidth
        multiline
        maxRows={2}
        onChange={handleComment}
        value={comment}
      />
      <Button
        onClick={handleAddEvaluation}
        disabled={comment === ""}
        sx={{ pt: 2 }}
      >
        Add Evaluation
      </Button>
      {loading && <Typography align="center">Adding ...</Typography>}
      {!loading && error && (
        <Typography color="error.main" align="center">
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <Typography color="success.main" align="center">
          {resultMessage}
        </Typography>
      )}
      <Divider sx={{ pt: 2 }} />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle1" align="left" sx={{ pt: 1 }}>
          Prompt Lines :
        </Typography>
        <Typography variant="subtitle1" align="right" sx={{ pt: 1 }}>
          {resultInfo.lines.toLocaleString()}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle1" align="right" sx={{ pt: 1 }}>
          Finish Reason :
        </Typography>
        <Typography
          variant="subtitle1"
          color={reasonColor}
          align="right"
          sx={{ pt: 1 }}
        >
          {resultInfo.finishReason}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle1" align="left" sx={{ pt: 1 }}>
          Prompt Tokens :
        </Typography>
        <Typography variant="subtitle1" align="right" sx={{ pt: 1 }}>
          {resultInfo.promptTokens.toLocaleString()}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle1" align="left" sx={{ pt: 1 }}>
          Completion Tokens :
        </Typography>
        <Typography variant="subtitle1" align="right" sx={{ pt: 1 }}>
          {resultInfo.completionTokens.toLocaleString()}
        </Typography>
      </Stack>
    </Stack>
  );
};

const marks = [
  {
    value: 0.0,
    label: "0.0",
  },
  {
    value: 1.0,
    label: "1.0",
  },
  {
    value: 2.0,
    label: "2.0",
  },
  {
    value: 3.0,
    label: "3.0",
  },
];

export default RightSideBar;
