import { Paper, TextField } from "@mui/material";
import { ChangeEvent } from "react";

// Component Interface
interface SystemContentProps {
  systemContent: string;
  systemContentRows: number;
  setSystemContent: (newValue: string) => void;
  setSystemContentRows: (newValue: number) => void;
}

// SystemContent Component
const SystemContent: React.FC<SystemContentProps> = ({
  systemContent,
  systemContentRows,
  setSystemContent,
  setSystemContentRows,
}) => {
  // handlers
  const handleSystemContent = (e: ChangeEvent<HTMLInputElement>) => {
    setSystemContent(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "+" && e.altKey) {
      setSystemContentRows(systemContentRows + 5);
    } else if (e.key === "-" && e.altKey) {
      if (systemContentRows > 5) {
        setSystemContentRows(systemContentRows - 5);
      }
    }
  };

  // jsx
  return (
    <Paper>
      <TextField
        label="System"
        variant="outlined"
        multiline
        fullWidth
        rows={systemContentRows}
        value={systemContent}
        onChange={handleSystemContent}
        onKeyDown={handleKeyDown}
        sx={styles.system}
      />
    </Paper>
  );
};

/** @type {import("@mui/material").SxProps} */
const styles = {
  system: {
    "& .MuiInputBase-root": {
      color: "black",
      backgroundColor: "grey.300",
    },
  },
};
export default SystemContent;
