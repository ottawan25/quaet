import {
  Paper,
  Button,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import React, { useState, useEffect } from "react";
import { sendPostRequest } from "../util/api";
import {
  AddChatData,
  ChatCompletionData,
  ResultInfo,
  ContentData,
} from "../types";

const COMPLETION_ENDPOINT = "/multiturn_completion";

// API Server Interface
interface MultiturnCompletionRequestData {
  user_id: string;
  qa_id: string;
  system_content: string | undefined;
  user_content: string | null;
  add_chat_data: AddChatData[];
  selected_model: string;
  prompt_class: string | null;
  temperature: number;
  max_tokens: number;
}
interface MultiturnCompletionResponseData {
  qa_id: string;
  finish_reason: string;
  assistant_content: string;
  completion_tokens: number;
  prompt_tokens: number;
  lines: number;
  prompt_class: string;
  temperature: number;
  model: string;
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

// Component Interface
interface UserContentProps {
  selectedModel: string;
  promptClass: string;
  temperature: number;
  maxTokens: number;
  value: string;
  color: string;
  userId: string;
  systemContent: string;
  chatdata: ChatCompletionData;
  qaId: string;
  userContentRows: number;
  setChatdata: React.Dispatch<React.SetStateAction<ChatCompletionData>>;
  setContents: React.Dispatch<React.SetStateAction<ContentData[]>>;
  setShowAddButton: (newValue: boolean) => void;
  setQaId: (newValue: string) => void;
  setResultInfo: (newValue: ResultInfo) => void;
  setModel: (newValue: string) => void;
  setUserContentRows: (newValue: number) => void;
}

// UserContent Component
const UserContent: React.FC<UserContentProps> = ({
  selectedModel,
  promptClass,
  temperature,
  maxTokens,
  value,
  color,
  userId,
  systemContent,
  chatdata,
  qaId,
  userContentRows,
  setChatdata,
  setContents,
  setShowAddButton,
  setQaId,
  setResultInfo,
  setModel,
  setUserContentRows,
}) => {
  // hooks
  const [text, setText] = useState<string>(value);
  const [askQuestionLoading, setAskQuestionLoading] = useState<boolean>(false);
  const [askQuestionError, setAskQuestionError] = useState<string>("");
  const [borderColor, setBorderColor] = useState<string>("grey.400");
  useEffect(() => {
    console.log("UserContent : useEffect called");
    console.log(`UserContent : value : ${value}`);
    setText(value);
    setBorderColor(color);
  }, [value, color]);

  // handlers
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("UserConent: handleChange called");
    setText(event.target.value);

    setContents((prev) => {
      const newContents = [...prev];
      if (newContents.length > 0) {
        newContents[newContents.length - 1].value = event.target.value;
      }
      return newContents;
    });

    if (chatdata.add_chat_data.length === 0) {
      const newChatdata: ChatCompletionData = {
        system_content: systemContent,
        user_content: event.target.value,
        add_chat_data: [],
      };
      setChatdata(newChatdata);
    } else {
      const userContent = chatdata.user_content;
      const newAddChatData: AddChatData[] = [...chatdata.add_chat_data];
      newAddChatData[chatdata.add_chat_data.length - 1].user_content =
        event.target.value;
      const newChatData: ChatCompletionData = {
        system_content: systemContent,
        user_content: userContent,
        add_chat_data: newAddChatData,
      };
      setChatdata(newChatData);
    }
  };

  const handleRequest = async () => {
    console.log("UserContent: handleRequest called");

    setAskQuestionLoading(true);
    setAskQuestionError("");
    chatdata.system_content = systemContent;
    if (chatdata.user_content === "") {
      chatdata.user_content = text;
    }
    const len = chatdata.add_chat_data.length;
    if (len >= 1) {
      chatdata.add_chat_data[len - 1].user_content = text;
    }
    const requestData: MultiturnCompletionRequestData = {
      user_id: userId,
      qa_id: qaId,
      system_content: systemContent,
      user_content: chatdata.user_content,
      add_chat_data: [...chatdata.add_chat_data],
      selected_model: selectedModel,
      prompt_class: promptClass,
      temperature: temperature,
      max_tokens: maxTokens,
    };
    console.log("--requestData--");
    console.log(requestData);
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + COMPLETION_ENDPOINT;

    try {
      const response = await sendPostRequest<
        MultiturnCompletionRequestData,
        MultiturnCompletionResponseData | ResponseErrorData
      >(url, requestData);
      console.log("--response.data--");
      console.log(response.data);
      if ("qa_id" in response.data) {
        const responseData = response.data as MultiturnCompletionResponseData;
        setQaId(responseData.qa_id);
        setResultInfo({
          lines: responseData.lines,
          finishReason: responseData.finish_reason,
          promptTokens: responseData.prompt_tokens,
          completionTokens: responseData.completion_tokens,
        });
        const data: AddChatData = {
          assistant_content: responseData.assistant_content,
          user_content: "",
        };
        setContents((prev) => [
          ...prev,
          {
            type: "assistant",
            value: responseData.assistant_content,
            color: "grey.500",
          },
        ]);
        setChatdata((prevChatData: ChatCompletionData) => ({
          ...prevChatData,
          system_content: prevChatData.system_content,
          user_content: prevChatData.user_content,
          add_chat_data: [...prevChatData.add_chat_data, data],
        }));
        setModel(responseData.model);
        setShowAddButton(true);
      } else {
        const errorData = response.data as ResponseErrorData;
        setAskQuestionError(errorData.detail);
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        setAskQuestionError(error.message);
      }
    } finally {
      setAskQuestionLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "+" && e.altKey) {
      setUserContentRows(userContentRows + 5);
    } else if (e.key === "-" && e.altKey) {
      if (userContentRows > 5) {
        setUserContentRows(userContentRows - 5);
      }
    }
  };

  // jsx
  return (
    <>
      <Paper elevation={5}>
        <TextField
          label="User ..."
          variant="outlined"
          multiline
          fullWidth
          value={text}
          rows={userContentRows}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="large"
                  endIcon={<SendIcon />}
                  onClick={handleRequest}
                  disabled={
                    text === "" || promptClass === "" || selectedModel === ""
                  }
                />
              </InputAdornment>
            ),
          }}
          sx={{
            ...styles.user,
            "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
              borderColor: borderColor,
            },
          }}
        />
      </Paper>
      {askQuestionLoading && <Typography>Loading...</Typography>}
      {askQuestionError && (
        <Typography color="error">{askQuestionError}</Typography>
      )}
    </>
  );
};

/** @type {import("@mui/material").SxProps} */
const styles = {
  user: {
    "& .MuiInputBase-root": {
      color: "black",
      backgroundColor: "grey.100",
    },
    "& .MuiInputBase-root:hover": {
      color: "black",
      backgroundColor: "#fcf9db",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "grey.400",
        borderWidth: "3px",
      },
    },
    "& .MuiOutlinedInput-root": {
      color: "black",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "grey.400",
        borderWidth: "3px",
      },
    },
  },
};

export default UserContent;
