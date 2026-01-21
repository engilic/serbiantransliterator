import React, { useState } from "react";
import { FluentProvider, webLightTheme, Button, Spinner, makeStyles } from "@fluentui/react-components";
import { Header } from "./Header";
import { SettingsPanel } from "./SettingsPanel";
import { ProgressBar } from "./ProgressBar";
import { StatusMessage, StatusType } from "./StatusMessage";

import { runSmartRefactored } from "../app/word/applyRefactored";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
    },
    content: {
        flex: 1,
        overflowY: "auto",
    },
    footer: {
        padding: "20px",
        borderTop: "1px solid #ccc",
        display: "flex",
        gap: "10px",
    },
});

export const App: React.FC = () => {
    const styles = useStyles();

    // === Settings State ===
    const [direction, setDirection] = useState("auto");
    const [protectBrands, setProtectBrands] = useState(true);

    const [serbianQuotes, setSerbianQuotes] = useState(true);
    const [preserveCode, setPreserveCode] = useState(true);
    const [proofingLang, setProofingLang] = useState(true);
    const [formatDates, setFormatDates] = useState(false);

    // === UI State ===
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<{ type: StatusType; msg: string; visible: boolean }>({
        type: "info",
        msg: "",
        visible: false,
    });

    const handleRun = async () => {
        setLoading(true);
        setStatus({ ...status, visible: false });
        setProgress(0);

        try {
            await runSmartRefactored({
                settings: {
                    direction,
                    protectBrands,
                    // Mapiranje React state-a na RunSettings interfejs
                    applySerbianQuotes: serbianQuotes,
                    preserveCodeBlocks: preserveCode,
                    setProofingLanguage: proofingLang,
                    formatDates: formatDates,
                },
                onProgress: (p: number) => setProgress(p),
                onStatus: (msg: string, type: string) => {
                    const safeType: StatusType =
                        type === "success" || type === "error" || type === "warning" ? type : "info";
                    setStatus({ type: safeType, msg, visible: true });
                },
            });
        } catch (e) {
            setStatus({ type: "error", msg: String(e), visible: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <FluentProvider theme={webLightTheme} className={styles.container}>
            <Header title="Serbian Transliterator" version="1.0.0" />

            <div className={styles.content}>
                <StatusMessage type={status.type} message={status.msg} visible={status.visible} />

                <ProgressBar value={progress} visible={loading} />

                <SettingsPanel
                    direction={direction}
                    setDirection={setDirection}
                    protectBrands={protectBrands}
                    setProtectBrands={setProtectBrands}
                    serbianQuotes={serbianQuotes}
                    setSerbianQuotes={setSerbianQuotes}
                    preserveCode={preserveCode}
                    setPreserveCode={setPreserveCode}
                    proofingLang={proofingLang}
                    setProofingLang={setProofingLang}
                    formatDates={formatDates}
                    setFormatDates={setFormatDates}
                />
            </div>

            <div className={styles.footer}>
                <Button
                    appearance="primary"
                    size="large"
                    onClick={handleRun}
                    disabled={loading}
                    style={{ flex: 1 }}
                >
                    {loading ? <Spinner size="tiny" /> : "PRESLOVI"}
                </Button>
                <Button size="large" disabled={loading}>
                    Pregled
                </Button>
            </div>
        </FluentProvider>
    );
};
