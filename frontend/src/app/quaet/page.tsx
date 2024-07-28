"use client";
import { Box, Grid } from "@mui/material";
import React, { useState } from "react";
import NavBar from "./components/NavBar";
import LeftSideBar from "./components/LeftSideBar";
import Center from "./components/Center";
import RightSideBar from "./components/RightSideBar";
import { ResultInfo, ContentData, ChatCompletionData } from "./types";

const PRE_DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant.";

const App = () => {
  // hooks
  const [userId, setUserId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("");
  const [promptClass, setPromptClass] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(
    PRE_DEFAULT_TEMPERATURE,
  );
  const [maxTokens, setMaxTokens] = useState<number>(2000);
  const [qaId, setQaId] = useState<string>("");
  const [resultInfo, setResultInfo] = useState<ResultInfo>({
    lines: 0,
    finishReason: "",
    promptTokens: 0,
    completionTokens: 0,
  });
  const [contents, setContents] = useState<ContentData[]>([
    { type: "user", value: "", color: "grey.400" },
  ]);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [rating, setRating] = useState<number>(0.0);
  const [comment, setComment] = useState<string>("");
  const [chatdata, setChatdata] = useState<ChatCompletionData>({
    system_content: "",
    user_content: "",
    add_chat_data: [],
  });
  const [systemContent, setSystemContent] = useState<string>(
    process.env.NEXT_PUBLIC_SYSTEM_CONTENT || DEFAULT_SYSTEM_PROMPT,
  );
  const [model, setModel] = useState<string>("");
  const [systemContentRows, setSystemContentRows] = useState<number>(
    Number(process.env.NEXT_PUBLIC_SYSTEM_CONTENT_ROWS),
  );
  const [userContentRows, setUserContentRows] = useState<number>(
    Number(process.env.NEXT_PUBLIC_USER_CONTENT_ROWS),
  );
  const [assistantContentRows, setAssistantContentRows] = useState<number>(
    Number(process.env.NEXT_PUBLIC_ASSISTANT_CONTENT_ROWS),
  );

  // jsx
  return (
    <>
      <Box sx={{ px: 3, pt: 1 }}>
        <NavBar userId={userId} setUserId={setUserId} />
        <Grid container spacing={0}>
          <Grid item xs={3}>
            <LeftSideBar
              selectedModel={selectedModel}
              promptClass={promptClass}
              temperature={temperature}
              contents={contents}
              maxTokens={maxTokens}
              chatdata={chatdata}
              systemContent={systemContent}
              setSelectedModel={setSelectedModel}
              setPromptClass={setPromptClass}
              setTemperature={setTemperature}
              setContents={setContents}
              setMaxTokens={setMaxTokens}
              setUserTokens={setUserTokens}
              setTotalTokens={setTotalTokens}
              setQaId={setQaId}
              setRating={setRating}
              setComment={setComment}
              setResultInfo={setResultInfo}
              setChatdata={setChatdata}
            />
          </Grid>
          <Grid item xs={6}>
            <Center
              selectedModel={selectedModel}
              promptClass={promptClass}
              temperature={temperature}
              maxTokens={maxTokens}
              contents={contents}
              userId={userId}
              userTokens={userTokens}
              totalTokens={totalTokens}
              chatdata={chatdata}
              systemContent={systemContent}
              qaId={qaId}
              systemContentRows={systemContentRows}
              userContentRows={userContentRows}
              assistantContentRows={assistantContentRows}
              setQaId={setQaId}
              setResultInfo={setResultInfo}
              setContents={setContents}
              setUserTokens={setUserTokens}
              setTotalTokens={setTotalTokens}
              setChatdata={setChatdata}
              setSystemContent={setSystemContent}
              setModel={setModel}
              setSystemContentRows={setSystemContentRows}
              setUserContentRows={setUserContentRows}
              setAssistantContentRows={setAssistantContentRows}
            />
          </Grid>
          <Grid item xs={3}>
            <RightSideBar
              qaId={qaId}
              resultInfo={resultInfo}
              promptClass={promptClass}
              temperature={temperature}
              rating={rating}
              comment={comment}
              selectedModel={selectedModel}
              model={model}
              contents={contents}
              setRating={setRating}
              setComment={setComment}
              setContents={setContents}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default App;
