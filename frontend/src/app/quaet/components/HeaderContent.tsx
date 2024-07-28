import { Stack, Button, Typography, Box } from "@mui/material";
import { useState } from "react";
import { AddChatData, ChatCompletionData } from "../types";
import { sendPostRequest } from "../util/api";

const CHECKTOKENS_ENDPOINT = "/count_tokens";

// API Server Interface
interface CheckTokensRequestData {
  system_content: string | undefined;
  user_content: string | null;
  add_chat_data: AddChatData[];
  selected_model: string;
}
interface CheckTokensResponseData {
  latest_user_tokens: number;
  total_tokens: number;
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

// Component Interface
interface HeaderContentProps {
  selectedModel: string;
  systemContent: string;
  chatdata: ChatCompletionData;
  userTokens: number;
  totalTokens: number;
  setUserTokens: (newValue: number) => void;
  setTotalTokens: (newValue: number) => void;
}

// HeaderContent Component
const HeaderContent: React.FC<HeaderContentProps> = ({
  selectedModel,
  systemContent,
  chatdata,
  userTokens,
  totalTokens,
  setUserTokens,
  setTotalTokens,
}) => {
  // hooks
  const [checkTokensLoading, setCheckTokensLoading] = useState<boolean>(false);
  const [checkTokensError, setCheckTokensError] = useState<string>("");

  // handlers
  const handleCheckTokens = async () => {
    console.log("handleCheckTokens called");
    setCheckTokensLoading(true);
    setCheckTokensError("");
    console.log(`chatdata.user_content : ${chatdata.user_content}`);
    const requestData: CheckTokensRequestData = {
      system_content: systemContent,
      user_content: chatdata.user_content,
      add_chat_data: [...chatdata.add_chat_data],
      selected_model: selectedModel,
    };
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + CHECKTOKENS_ENDPOINT;
    try {
      const response = await sendPostRequest<
        CheckTokensRequestData,
        CheckTokensResponseData | ResponseErrorData
      >(url, requestData);
      console.log("--response.data--");
      console.log(response.data);
      if ("total_tokens" in response.data) {
        const responseData = response.data as CheckTokensResponseData;
        setUserTokens(responseData.latest_user_tokens);
        setTotalTokens(responseData.total_tokens);
      } else {
        const errorData = response.data as ResponseErrorData;
        setCheckTokensError(errorData.detail);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message) {
        setCheckTokensError(error.message);
      }
    } finally {
      setCheckTokensLoading(false);
    }
  };

  // jsx
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="space-around"
        sx={{ pt: 2 }}
      >
        <Button onClick={handleCheckTokens}>Tokens</Button>
        <Typography>User: </Typography>
        <Typography>{userTokens.toLocaleString()}</Typography>
        <Typography>Total: </Typography>
        <Typography>{totalTokens.toLocaleString()}</Typography>
      </Stack>
      <Stack>
        <Box>
          {checkTokensLoading && <Typography>Loading...</Typography>}
          {checkTokensError && (
            <Typography color="error">{checkTokensError}</Typography>
          )}
        </Box>
      </Stack>
    </>
  );
};

export default HeaderContent;
