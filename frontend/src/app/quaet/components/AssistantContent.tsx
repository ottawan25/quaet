import {
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Tooltip,
  Box,
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { ContentCopy } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { ContentData } from "../types";

// Component Interface
interface AssistantContentProps {
  value: string;
  showAddButton: boolean;
  index: number;
  length: number;
  assistantContentRows: number;
  setContents: React.Dispatch<React.SetStateAction<ContentData[]>>;
  setShowAddButton: (newValue: boolean) => void;
  setAssistantContentRows: (newValue: number) => void;
}

// AssistantContent Component
const AssistantContent: React.FC<AssistantContentProps> = ({
  value,
  showAddButton,
  index,
  length,
  assistantContentRows,
  setContents,
  setShowAddButton,
  setAssistantContentRows,
}) => {
  // hooks
  const [text, setText] = useState<string>(value);

  // handlers
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(text);
  };

  const handleAddUserContent = () => {
    console.log("AssistantContent: handleAddUserContent called");
    setContents((prev) => [
      ...prev,
      { type: "user", value: "", color: "grey.400" },
    ]);
    setShowAddButton(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "+" && e.altKey) {
      setAssistantContentRows(assistantContentRows + 5);
    } else if (e.key === "-" && e.altKey) {
      if (assistantContentRows > 5) {
        setAssistantContentRows(assistantContentRows - 5);
      }
    }
  };

  // jsx
  return (
    <>
      <Paper elevation={5}>
        <TextField
          label="Assistant ..."
          variant="outlined"
          multiline
          fullWidth
          rows={assistantContentRows}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="copied" placement="right">
                  <Button
                    size="large"
                    endIcon={<ContentCopy />}
                    onClick={handleCopy}
                  />
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={styles.assistant}
        />
      </Paper>
      {showAddButton && index + 1 === length && (
        <Box>
          <IconButton onClick={handleAddUserContent}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
      )}
    </>
  );
};

/** @type {import("@mui/material").SxProps} */
const styles = {
  assistant: {
    "& .MuiInputBase-root": {
      color: "black",
      backgroundColor: "grey.300",
    },
    "& .MuiInputBase-root:hover": {
      color: "black",
      backgroundColor: "#fbf3b4",
    },
    "& .MuiOutlinedInput-root": {
      color: "black",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "grey.500",
        borderWidth: "1.5px",
      },
    },
  },
};

export default AssistantContent;
