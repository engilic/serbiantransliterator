import React from "react";
import { Checkbox, Dropdown, Option, Label, makeStyles, tokens, Divider } from "@fluentui/react-components";

interface SettingsPanelProps {
    protectBrands: boolean;
    setProtectBrands: (v: boolean) => void;

    direction: string;
    setDirection: (v: string) => void;

    // NOVI PROPOVI
    serbianQuotes: boolean;
    setSerbianQuotes: (v: boolean) => void;

    preserveCode: boolean;
    setPreserveCode: (v: boolean) => void;

    proofingLang: boolean;
    setProofingLang: (v: boolean) => void;

    formatDates: boolean;
    setFormatDates: (v: boolean) => void;
}

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
        backgroundColor: tokens.colorNeutralBackground1,
    },
    sectionTitle: {
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground2,
        textTransform: "uppercase",
        fontSize: "12px",
        marginTop: "8px",
    },
});

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    protectBrands, setProtectBrands,
    direction, setDirection,
    serbianQuotes, setSerbianQuotes,
    preserveCode, setPreserveCode,
    proofingLang, setProofingLang,
    formatDates, setFormatDates
}) => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            <Label className={styles.sectionTitle}>Smer Preslovljavanja</Label>
            <Dropdown
                aria-label="Izbor smera"
                value={direction === "auto" ? "Automatski" : direction === "lat-to-cyr" ? "Lat → Ćir" : direction === "cyr-to-lat" ? "Ćir → Lat" : direction}
                selectedOptions={[direction]}
                onOptionSelect={(_, data) => setDirection(data.optionValue as string)}
            >
                <Option value="auto" text="Automatski">Automatski</Option>
                <Option value="lat-to-cyr" text="Lat → Ćir">Lat → Ćir</Option>
                <Option value="cyr-to-lat" text="Ćir → Lat">Ćir → Lat</Option>
                <Option value="to-ascii" text="Ošišana latinica">Ošišana latinica</Option>
            </Dropdown>

            <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />

            <Label className={styles.sectionTitle}>Zaštita & Korekcije</Label>

            <Checkbox
                checked={protectBrands}
                onChange={(_, data) => setProtectBrands(data.checked as boolean)}
                label="Zaštiti brendove (iPhone, Windows...)"
            />

            <Checkbox
                checked={preserveCode}
                onChange={(_, data) => setPreserveCode(data.checked as boolean)}
                label="Zaštiti kod (inline `...` i blok ```...```)"
            />

            <Checkbox
                checked={serbianQuotes}
                onChange={(_, data) => setSerbianQuotes(data.checked as boolean)}
                label="Pametni navodnici („ ... ”)"
            />

            <Checkbox
                checked={proofingLang}
                onChange={(_, data) => setProofingLang(data.checked as boolean)}
                label="Postavi jezik provere (Proofing Language)"
            />

            <Checkbox
                checked={formatDates}
                onChange={(_, data) => setFormatDates(data.checked as boolean)}
                label="Formatiraj datume (npr. 21.10.2023.)"
            />
        </div>
    );
};
