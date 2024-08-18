import { Box, Stack } from "@mui/material";
import React, { useState, useEffect } from "react";
import HeaderContent from "./HeaderContent";
import SystemContent from "./SystemContent";
import UserContent from "./UserContent";
import AssistantContent from "./AssistantContent";
import { ChatCompletionData, ResultInfo, ContentData } from "../types";

// Component Interface
interface CenterProps {
  selectedModel: string;
  promptClass: string;
  temperature: number;
  maxTokens: number;
  contents: ContentData[];
  userId: string;
  userTokens: number;
  totalTokens: number;
  chatdata: ChatCompletionData;
  systemContent: string;
  qaId: string;
  systemContentRows: number;
  userContentRows: number;
  assistantContentRows: number;
  isSelectedModel: boolean;
  setQaId: (newValue: string) => void;
  setResultInfo: (newValue: ResultInfo) => void;
  setContents: React.Dispatch<React.SetStateAction<ContentData[]>>;
  setUserTokens: (newValue: number) => void;
  setTotalTokens: (newValue: number) => void;
  setChatdata: React.Dispatch<React.SetStateAction<ChatCompletionData>>;
  setSystemContent: (newValue: string) => void;
  setModel: (newValue: string) => void;
  setSystemContentRows: (newValue: number) => void;
  setUserContentRows: (newValue: number) => void;
  setAssistantContentRows: (newValue: number) => void;
}

// Center Component
const Center: React.FC<CenterProps> = ({
  selectedModel,
  promptClass,
  temperature,
  maxTokens,
  contents,
  userId,
  userTokens,
  totalTokens,
  chatdata,
  systemContent,
  qaId,
  systemContentRows,
  userContentRows,
  assistantContentRows,
  isSelectedModel,
  setQaId,
  setResultInfo,
  setContents,
  setUserTokens,
  setTotalTokens,
  setChatdata,
  setSystemContent,
  setModel,
  setSystemContentRows,
  setUserContentRows,
  setAssistantContentRows,
}) => {
  // hooks
  const [showAddButton, setShowAddButton] = useState(false);
  useEffect(() => {
    console.log(`Center : useEffect called`);
    console.log(`Center : Contents updated: `, contents);
  }, [contents]);

  // jsx
  return (
    <>
      <HeaderContent
        selectedModel={selectedModel}
        systemContent={systemContent}
        chatdata={chatdata}
        userTokens={userTokens}
        totalTokens={totalTokens}
        isSelectedModel={isSelectedModel}
        setUserTokens={setUserTokens}
        setTotalTokens={setTotalTokens}
      />
      <Box sx={{ m: 2, pt: 1, height: "80vh", overflowY: "auto" }}>
        <Stack spacing={2}>
          <SystemContent
            systemContent={systemContent}
            systemContentRows={systemContentRows}
            setSystemContent={setSystemContent}
            setSystemContentRows={setSystemContentRows}
          />
          {contents.map((content, index) => (
            <React.Fragment key={index}>
              {content.type === "user" ? (
                <UserContent
                  selectedModel={selectedModel}
                  promptClass={promptClass}
                  temperature={temperature}
                  maxTokens={maxTokens}
                  value={content.value}
                  color={content.color}
                  userId={userId}
                  systemContent={systemContent}
                  chatdata={chatdata}
                  qaId={qaId}
                  userContentRows={userContentRows}
                  setChatdata={setChatdata}
                  setContents={setContents}
                  setShowAddButton={setShowAddButton}
                  setQaId={setQaId}
                  setResultInfo={setResultInfo}
                  setModel={setModel}
                  setUserContentRows={setUserContentRows}
                />
              ) : (
                <AssistantContent
                  value={content.value}
                  showAddButton={showAddButton}
                  index={index}
                  length={contents.length}
                  assistantContentRows={assistantContentRows}
                  setContents={setContents}
                  setShowAddButton={setShowAddButton}
                  setAssistantContentRows={setAssistantContentRows}
                />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default Center;
