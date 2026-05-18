import { useState, useRef, useEffect } from "react";

const LIMIT_OPTIONS = ["all", 5, 10, 15];

const LimitDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectValue = (val) => {
        onChange(val);
        setOpen(false);
    };

    const handleCustomApply = () => {
        const num = Number(customValue);
        if (!num || num < 1) return;

        onChange(num);
        setOpen(false);
        setCustomValue("");
    };

    return (
        <div
            ref={wrapperRef}
            style={{
                position: "relative",
                width: "15%",
                // maxWidth: "180px",
            }}
        >
            {/* Trigger */}
            <div
                onClick={() => setOpen((p) => !p)}
                style={{
                    padding: "10px",
                    border: "1px solid #2a2a2a",
                    background: "#1e1e1e",
                    color: "#e6e6e6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    userSelect: "none",
                }}
            >
                <span>Limit: {value}</span>
                <span style={{ opacity: 0.6 }}>▾</span>
            </div>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        right: 0,
                        background: "#1b1b1b",
                        border: "1px solid #2a2a2a",
                        borderRadius: "8px",
                        zIndex: 1000,
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                    }}
                >
                    {/* options */}
                    {LIMIT_OPTIONS.map((opt) => (
                        <div
                            key={opt}
                            onClick={() => selectValue(opt)}
                            style={{
                                padding: "10px",
                                cursor: "pointer",
                                color: "#e6e6e6",
                                transition: "0.2s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#2a2a2a")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                            }
                        >
                            {opt}
                        </div>
                    ))}

                    {/* divider */}
                    <div style={{ height: "1px", background: "#2a2a2a" }} />

                    {/* custom input */}
                    <div
                        style={{
                            padding: "10px",
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="number"
                            placeholder="Custom"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "8px",
                                background: "#121212",
                                border: "1px solid #2a2a2a",
                                borderRadius: "6px",
                                color: "#e6e6e6",
                                outline: "none",
                                minWidth: 0,
                                // minWidth: "144rem",
                            }}
                        />

                        <button
                            onClick={handleCustomApply}
                            style={{
                                padding: "8px 10px",
                                background: "#2a2a2a",
                                border: "1px solid #3a3a3a",
                                borderRadius: "6px",
                                color: "#e6e6e6",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LimitDropdown;