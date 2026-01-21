import React from "react";
import { Text, tokens, makeStyles } from "@fluentui/react-components";

// Koristimo Fluent UI styling system
const useStyles = makeStyles({
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    title: {
        color: tokens.colorBrandForeground1,
        fontWeight: tokens.fontWeightSemibold,
        fontSize: "18px",
    },
    version: {
        fontSize: "11px",
        color: tokens.colorNeutralForeground2,
        backgroundColor: tokens.colorNeutralBackground2,
        padding: "2px 6px",
        borderRadius: "4px",
    },
});

interface HeaderProps {
    title: string;
    version: string;
}

export const Header: React.FC<HeaderProps> = ({ title, version }) => {
    const styles = useStyles();

    return (
        <header className={styles.header}>
            <Text className={styles.title} as="h1">{title}</Text>
            <span className={styles.version}>v{version}</span>
        </header>
    );
};
