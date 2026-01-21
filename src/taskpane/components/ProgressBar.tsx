import React from "react";
import { ProgressBar as FluentProgressBar, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: "0 20px",
        marginTop: "10px",
    },
    label: {
        fontSize: "11px",
        color: tokens.colorNeutralForeground2,
        marginBottom: "4px",
        display: "block",
    },
});

interface Props {
    value: number; // 0-100
    visible: boolean;
}

export const ProgressBar: React.FC<Props> = ({ value, visible }) => {
    const styles = useStyles();
    if (!visible) return null;

    return (
        <div className={styles.root}>
            <span className={styles.label}>Obrada... {value}%</span>
            <FluentProgressBar value={value} max={100} color="success" />
        </div>
    );
};
