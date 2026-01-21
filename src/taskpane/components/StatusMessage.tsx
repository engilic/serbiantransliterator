import React from "react";
import { MessageBar, MessageBarBody, MessageBarTitle, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        margin: "10px 20px",
    },
});

export type StatusType = "info" | "success" | "error" | "warning";

interface Props {
    type: StatusType;
    title?: string;
    message: string;
    visible: boolean;
}

export const StatusMessage: React.FC<Props> = ({ type, title, message, visible }) => {
    const styles = useStyles();
    if (!visible) return null;

    return (
        <div className={styles.root}>
            <MessageBar intent={type}>
                <MessageBarBody>
                    {title && <MessageBarTitle>{title}</MessageBarTitle>}
                    {message}
                </MessageBarBody>
            </MessageBar>
        </div>
    );
};
