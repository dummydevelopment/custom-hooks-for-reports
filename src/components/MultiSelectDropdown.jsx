import React, { useEffect, useRef, useState } from "react";

const MultiSelectDropdown = ({
    label,
    options = [],
    selected = [],
    setSelected,
    placeholder = "Select...",
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const dropdownRef = useRef(null);
    const itemRefs = useRef([]);

    // ======================
    // OUTSIDE CLICK CLOSE
    // ======================
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
                setSearch("");
                setHighlightIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ======================
    // FILTER
    // ======================
    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    // ======================
    // TOGGLE
    // ======================
    const handleSelect = (value) => {
        setSelected((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    // ======================
    // SELECT ALL / CLEAR
    // ======================
    const selectAll = () => setSelected(filteredOptions);
    const clearAll = () => setSelected([]);

    // ======================
    // KEY NAVIGATION
    // ======================
    const handleKeyDown = (e) => {
        if (!open) return;

        if (e.key === "ArrowDown") {
            setHighlightIndex((p) =>
                Math.min(p + 1, filteredOptions.length - 1)
            );
        }

        if (e.key === "ArrowUp") {
            setHighlightIndex((p) => Math.max(p - 1, 0));
        }

        if (e.key === "Enter") {
            const item = filteredOptions[highlightIndex];
            if (item) handleSelect(item);
        }

        if (e.key === "Escape") {
            setOpen(false);
            setSearch("");
        }
    };

    useEffect(() => {
        if (
            highlightIndex >= 0 &&
            itemRefs.current[highlightIndex]
        ) {
            itemRefs.current[highlightIndex].scrollIntoView({
                block: "nearest",
            });
        }
    }, [highlightIndex]);

    return (
        <div
            ref={dropdownRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={{
                // width: "10rem",
                position: "relative",
                color: "#e5e5e5",
                fontFamily: "sans-serif",
                // display:"flex",
                // justifyContent:"center",
                // alignItems:"center",
                // gap:"1rem"

            }}
        >
            {/* LABEL */}
            <label
                style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                }}
            >
                {label}
            </label>

            {/* SELECT BOX */}
            <div
                onClick={() => setOpen((p) => !p)}
                style={{
                    border: "1px solid #2a2a2a",
                    background: "#121212",
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    // minHeight: "40px",
                    alignItems: "center",
                }}
            >
                {selected.length ? (
                    selected.map((item) => (
                        <span
                            key={item}
                            style={{
                                background: "#1f1f1f",
                                padding: "3px 8px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                border: "1px solid #2a2a2a",
                            }}
                        >
                            {item}
                        </span>
                    ))
                ) : (
                    <span style={{ color: "#6b7280" }}>
                        {placeholder}
                    </span>
                )}

                <span
                    style={{
                        marginLeft: "auto",
                        color: "#6b7280",
                    }}
                >
                    ▼
                </span>
            </div>

            {/* DROPDOWN */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "6px",
                        borderRadius: "6px",
                        border: "1px solid #2a2a2a",
                        background: "#0f0f0f",
                        zIndex: 1000,
                        maxHeight: "260px",
                        overflowY: "auto",
                    }}
                >
                    {/* SEARCH */}
                    <div style={{ padding: "8px" }}>
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search..."
                            style={{
                                width: "80%",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                border: "1px solid #2a2a2a",
                                background: "#121212",
                                color: "#e5e5e5",
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* ACTIONS */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0 8px 8px",
                        }}
                    >
                        <button
                            onClick={selectAll}
                            style={btnStyle}
                        >
                            All
                        </button>

                        <button
                            onClick={clearAll}
                            style={btnStyle}
                        >
                            Clear
                        </button>
                    </div>

                    {/* OPTIONS */}
                    {filteredOptions.map((option, index) => (
                        <label
                            key={option}
                            ref={(el) =>
                                (itemRefs.current[index] = el)
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px",
                                cursor: "pointer",
                                background:
                                    highlightIndex === index
                                        ? "#1a1a1a"
                                        : "transparent",
                                color: "#d1d5db",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() =>
                                    handleSelect(option)
                                }
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const btnStyle = {
    background: "#121212",
    color: "#9ca3af",
    border: "1px solid #2a2a2a",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
};

export default MultiSelectDropdown;