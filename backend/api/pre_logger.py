import logging
import logging.handlers

LOGFILE_EXTENSION = ".log"
LOGFILE_MAXBYTES = 800000
LOGFILE_BACKUPCOUNT = 8

mapping = {
    "DEBUG": "\x1b[0;36m",  # Cyan
    "INFO": "\x1b[0;32m",  # Green
    "WARNING": "\x1b[0;33m",  # Yellow
    "ERROR": "\x1b[0;31m",  # Red
    "CRITICAL": "\x1b[0;37;41m",  # White on Red background
}


class CustomFormatter(logging.Formatter):
    def format(self, record):
        log_color = mapping.get(record.levelname, "\x1b[0m")  # Default to no color
        reset_color = "\x1b[0m"

        formatted_message = f"{log_color}%(asctime)s.%(msecs)03d %(levelname)-8s %(name)-8s {reset_color}%(message)s"

        formatter = logging.Formatter(
            formatted_message,
            datefmt="%Y%m%d %H:%M:%S",
        )
        return formatter.format(record)


def pre_logger(module_name: str, log_dir: str) -> logging.Logger:
    logger = logging.getLogger(module_name)
    logger.handlers.clear()

    stream_handler = logging.StreamHandler()
    logfile = log_dir + module_name + LOGFILE_EXTENSION
    file_handler = logging.handlers.RotatingFileHandler(
        logfile, maxBytes=LOGFILE_MAXBYTES, backupCount=LOGFILE_BACKUPCOUNT
    )
    formatter = logging.Formatter(
        "%(asctime)s.%(msecs)03d %(levelname)-8s %(name)-8s %(message)s",
        datefmt="%Y%m%d %H:%M:%S",
    )
    stream_handler.setFormatter(CustomFormatter())
    file_handler.setFormatter(formatter)

    logger.setLevel(logging.DEBUG)
    stream_handler.setLevel(logging.INFO)
    file_handler.setLevel(logging.DEBUG)

    logger.addHandler(stream_handler)
    logger.addHandler(file_handler)

    return logger
