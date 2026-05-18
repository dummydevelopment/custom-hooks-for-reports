import { useEffect, useState } from "react";
import { getLeafColumns, getValue } from "../components/CustomTable";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import DynamicFilter from "../components/DynamicFilter";
import LimitDropdown from "./reportFetchHookComponents/LimitDropdown";

const useReportFetchWithFilter = ({ baseUrl, columns, filters = [], limit: initialLimit = 6, // 👈 rename + default fallback
}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(initialLimit);
    const [skip, setSkip] = useState(0); // 👈 pagination
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    // ==============================
    // CLASS + SECTION FILTERS
    // ==============================

    const [classes, setClasses] = useState([]);

    const [sections, setSections] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");

    const [selectedSection, setSelectedSection] = useState("");

    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);

    const [downloadMode, setDownloadMode] = useState("filtered");

    // ==============================
    // filter states
    // ==============================
    const [filtersState, setFiltersState] = useState({});
    const [filterOptions, setFilterOptions] = useState({});
    const country = filtersState.country;
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const optionsData = {};

                for (const filter of filters) {
                    let url = `${import.meta.env.VITE_BACKEND_URL}${filter.endpoint}`;

                    // ✅ HANDLE DEPENDENCY
                    if (filter.dependsOn) {
                        const depValue = filtersState[filter.dependsOn];

                        const normalized =
                            Array.isArray(depValue)
                                ? depValue.join(",")
                                : depValue;

                        if (!normalized || normalized.length === 0) {
                            optionsData[filter.key] = [];
                            continue;
                        }

                        url += `?${filter.dependsOn}=${normalized}`;
                    }

                    const res = await fetch(url);
                    const result = await res.json();

                    optionsData[filter.key] =
                        result.options || [];
                }

                setFilterOptions(optionsData);

            } catch (err) {
                console.error("Failed to fetch filter options", err);
            }
        };

        fetchFilterOptions();

    }, []);
    // }, [country, filters]);

    // ==============================
    // FETCH UNIQUE CLASSES
    // ==============================
    useEffect(() => {

        const controller = new AbortController();

        const fetchClasses = async () => {

            try {

                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/reports/students/classes`,
                    {
                        signal: controller.signal,
                    }
                );

                const result = await res.json();

                if (!controller.signal.aborted) {
                    setClasses(result.classes || []);
                }

            } catch (err) {

                if (err.name === "AbortError") {
                    return;
                }

                console.error(
                    "Failed to fetch classes",
                    err
                );
            }
        };

        fetchClasses();

        return () => {
            controller.abort();
        };

    }, []);


    // ==============================
    // FETCH SECTIONS BY CLASS
    // ==============================
    useEffect(() => {

        if (!selectedClasses.length) {

            setSections([]);
            setSelectedSections([]);

            return;
        }

        const controller = new AbortController();

        const fetchSections = async () => {

            try {

                const params =
                    new URLSearchParams({ classes: selectedClasses.join(","), });

                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/reports/students/sections?${params}`,
                    {
                        signal: controller.signal,
                    }
                );

                const result =
                    await res.json();

                if (!controller.signal.aborted) {
                    setSections(
                        result.sections || []
                    );
                }

            } catch (err) {

                if (err.name === "AbortError") {
                    return;
                }

                console.error(
                    "Failed to fetch sections",
                    err
                );
            }
        };

        fetchSections();

        return () => {
            controller.abort();
        };

    }, [selectedClasses]);

    const buildQueryParams = ({
        includePagination = true,
        includeFilters = true,
    } = {}) => {

        const params = new URLSearchParams();
        // ✅ fetch all rows
        if (downloadMode === "all") {
            params.set("limit", "all");
        }
        // pagination
        if (includePagination) {
            params.append("limit", String(limit));
            params.append("skip", String(skip));
        }

        // search
        if (includeFilters && search.trim()) {
            params.append("search", search);
        }

        // sorting
        if (includeFilters && sortBy) {
            params.append("sortBy", sortBy);
            params.append("order", sortOrder);
        }

        // ! single class/section
        // if (includeFilters && selectedClass) {
        //     params.append("class", selectedClass);
        // }

        // if (includeFilters && selectedSection) {
        //     params.append("section", selectedSection);
        // }

        // ! multi classes/sections
        if (includeFilters && selectedClasses.length) {
            params.append(
                "classes",
                selectedClasses.join(",")
            );
        }

        if (includeFilters && selectedSections.length) {
            params.append(
                "sections",
                selectedSections.join(",")
            );
        }

        // dynamic filters
        if (includeFilters) {

            Object.entries(filtersState).forEach(
                ([key, value]) => {

                    if (
                        Array.isArray(value) &&
                        value.length
                    ) {
                        params.append(
                            key,
                            value.join(",")
                        );
                    }
                    else if (value) {
                        params.append(key, value);
                    }
                }
            );
        }

        return params;
    };
    // ==============================
    // FETCH SECTIONS BY CLASS
    // ==============================
    useEffect(() => {
        if (!baseUrl) return;
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // const params = new URLSearchParams({
                //     limit,
                //     skip,
                // });

                // // ✅ add search only if exists
                // if (search.trim()) {
                //     params.append("search", search);
                // }

                // // ✅ add sorting
                // if (sortBy) {
                //     params.append("sortBy", sortBy);
                //     params.append("order", sortOrder);
                // }
                // // ✅ class filter
                // if (selectedClass) {
                //     params.append("class", selectedClass);
                // }

                // // ✅ section filter
                // if (selectedSection) {
                //     params.append("section", selectedSection);
                // }
                // if (selectedClasses.length) {
                //     params.append("classes", selectedClasses.join(","));
                // }

                // if (selectedSections.length) {
                //     params.append("sections", selectedSections.join(","));
                // }

                // Object.entries(filtersState).forEach(([key, value]) => {

                //     // array values
                //     if (Array.isArray(value) && value.length) {
                //         params.append(key, value.join(","));
                //     }

                //     // single values
                //     else if (value) {
                //         params.append(key, value);
                //     }
                // });

                // const url = `${baseUrl}?${params.toString()}`;
                const params = buildQueryParams();

                const url =
                    `${baseUrl}?${params.toString()}`;
                const res = await fetch(url, {
                    signal: controller.signal,

                });

                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }

                const result = await res.json();

                // don't update if aborted
                if (!controller.signal.aborted) {
                    setData(result);
                }
            } catch (err) {
                // ignore abort errors
                if (err.name === "AbortError") {
                    console.log("Request aborted");
                    return;
                }
                setError(err.message || "Something went wrong");
                setData({});
                // setError("hi Something went wrong");
            } finally {

                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        // cleanup
        return () => {
            controller.abort();
        };
    }, [baseUrl, limit, skip, search, sortOrder, sortBy, selectedClass, selectedSection, selectedClasses, selectedSections, filtersState,]);
    // ! not using export to exce 
    const exportToExcel = async () => {
        try {
            // const params = new URLSearchParams();

            // params.append("limit", 0);

            // if (search.trim()) {
            //     params.append("search", search);
            // }

            // if (sortBy) {
            //     params.append("sortBy", sortBy);
            //     params.append("order", sortOrder);
            // }
            // if (selectedClass) {
            //     params.append("class", selectedClass);
            // }

            // if (selectedSection) {
            //     params.append("section", selectedSection);
            // }
            const params = buildQueryParams({
                includePagination: false,
            });

            const url = `${baseUrl}?${params.toString()}`;

            const res = await fetch(url);
            const result = await res.json();

            const rows = result.data || result.users || result.products || result;

            // 🔥 reuse table structure
            const leafColumns = getLeafColumns(columns);

            const headers = leafColumns.map((col) => col.header);

            const csvRows = [
                headers.join(","),
                ...rows.map((row) =>
                    leafColumns
                        .map((col) => {
                            const value = col.accessor
                                ? getValue(row, col.accessor)
                                : col.render
                                    ? col.render(row)
                                    : "";
                            return JSON.stringify(value ?? "");
                        })
                        .join(",")
                ),
            ];

            const csv = csvRows.join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const urlBlob = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = urlBlob;
            a.download = "report-export.csv";
            a.click();

            window.URL.revokeObjectURL(urlBlob);
        } catch (err) {
            console.error("Export failed", err);
        }
    };
    // ! using this now 
    const handleDownload = async ({ mode = "filtered" ,fileType="csv"}) => {

        try {

            // const params = new URLSearchParams();

            // // always fetch everything if "all"
            // if (mode === "all") {
            // // params.append("limit", 0);
            // } else {
            //     params.append("limit", limit);
            //     params.append("skip", skip);
            // }

            // // apply filters only for filtered mode
            // if (mode === "filtered") {

            //     if (search.trim()) {
            //         params.append("search", search);
            //     }

            //     if (sortBy) {
            //         params.append("sortBy", sortBy);
            //         params.append("order", sortOrder);
            //     }

            //     if (selectedClass) {
            //         params.append("class", selectedClass);
            //     }

            //     if (selectedSection) {
            //         params.append("section", selectedSection);
            //     }

            //     if (selectedClasses.length) {
            //         params.append("classes", selectedClasses.join(","));
            //     }

            //     if (selectedSections.length) {
            //         params.append("sections", selectedSections.join(","));
            //     }
            // }
            const includePagination = mode !== "all";

            const includeFilters = mode === "filtered";

            const params = buildQueryParams({

                includePagination,
                includeFilters,
            });
            const url = `${baseUrl}?${params.toString()}`;

            const res = await fetch(url);
            const result = await res.json();

            const rows =
                result.data ||
                result.users ||
                result.products ||
                result.marks ||
                result;

            const leafColumns = getLeafColumns(columns);

            const headers = leafColumns?.map(
                (col) => col.header
            );

            const csvRows = [
                headers.join(","),
                ...rows?.map((row) =>
                    leafColumns
                        .map((col) => {
                            const value =
                                col.accessor
                                    ? getValue(row, col.accessor)
                                    : col.render
                                        ? col.render(row)
                                        : "";

                            return JSON.stringify(
                                value ?? ""
                            );
                        })
                        .join(",")
                ),
            ];

            const csv =
                csvRows.join("\n");

            const blob =
                new Blob([csv], {
                    type: "text/csv",
                });

            const urlBlob =
                window.URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = urlBlob;
            a.download =
                mode === "all"
                    ? "report-all.csv"
                    : "report-filtered.csv";

            a.click();

            window.URL.revokeObjectURL(urlBlob);

        } catch (err) {
            console.error("Download failed", err);
        }
    };
    const handleSort = (column) => {
        if (!column.accessor) return;

        // same column clicked again
        if (sortBy === column.accessor) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column.accessor);
            setSortOrder("asc");
        }

        // reset pagination
        setSkip(0);
    };
    // ✅ Renderable component inside hook
    const InpurLimitComponent = () => {
        return (
            <LimitDropdown
                value={limit}
                onChange={(val) => setLimit(val)}
            />
        )
    };
    // ✅ PAGINATION CONTROLS
    const PaginationComponent = () => (
        <div style={{ marginTop: "20px" }}>
            <button
                disabled={skip === 0}
                onClick={() => setSkip((prev) => Math.max(prev - limit, 0))}
            >
                Prev
            </button>

            <span style={{ margin: "0 10px" }}>
                Page: {Math.floor(skip / limit) + 1}
            </span>

            <button
                disabled={skip + limit >= (data?.total || 0)}
                onClick={() => setSkip((prev) => prev + limit)}
            >
                Next
            </button>
        </div>
    );
    // ✅ SEARCH UI FUNCTION (your request)
    const RenderSearchInputComponent = () => {
        return (
            <div>
                <label>Search: </label>
                <input
                    type="text"
                    value={search}
                    placeholder="search..."
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        );
    };
    // ==============================
    // CLASS FILTER COMPONENT
    // ==============================
    const ClassFilterComponent = () => {
        return (
            <MultiSelectDropdown
                label="Classes"
                options={classes}
                selected={selectedClasses}
                setSelected={setSelectedClasses}
            />
        )
        return (
            <div>

                <label>
                    Class:
                </label>

                <select
                    value={selectedClass}
                    onChange={(e) => {

                        setSelectedClass(
                            e.target.value
                        );

                        // reset section
                        setSelectedSection("");

                        // reset pagination
                        setSkip(0);
                    }}
                >

                    <option value="">
                        All Classes
                    </option>

                    {classes.map((cls) => (
                        <option
                            key={cls}
                            value={cls}
                        >
                            {cls}
                        </option>
                    ))}

                </select>
            </div>
        );
    };
    // ==============================
    // SECTION FILTER COMPONENT
    // ==============================
    const SectionFilterComponent = () => {
        return (
            <MultiSelectDropdown
                label="Sections"
                options={sections}
                selected={selectedSections}
                setSelected={setSelectedSections}
            />
        )
        return (
            <div>

                <label>
                    Section:
                </label>

                <select
                    value={selectedSection}
                    disabled={!selectedClass}
                    onChange={(e) => {

                        setSelectedSection(
                            e.target.value
                        );

                        setSkip(0);
                    }}
                >

                    <option value="">
                        All Sections
                    </option>

                    {sections.map((section) => (
                        <option
                            key={section}
                            value={section}
                        >
                            {section}
                        </option>
                    ))}

                </select>
            </div>
        );
    };
    const DownloadModeSelectComponent = () => {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    margin: "10px 0",
                    border: "1px solid #444",
                    borderRadius: "6px",
                    // overflow: "hidden",
                    // width: "fit-content",
                }}
            >

                {/* Dropdown */}
                <select
                    value={downloadMode}
                    onChange={(e) =>
                        setDownloadMode(e.target.value)
                    }
                    style={{
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "none",
                        padding: "8px 10px",
                        outline: "none",
                    }}
                >
                    <option value="filtered">
                        With Filters
                    </option>

                    <option value="all">
                        All Data
                    </option>
                </select>

                {/* Divider */}
                <div
                    style={{
                        width: "1px",
                        background: "#444",
                    }}
                />

                {/* Button */}
                <button
                    onClick={() =>
                        handleDownload({ mode: downloadMode })
                    }
                    style={{
                        background: "#2b2b2b",
                        color: "#fff",
                        border: "none",
                        // padding: "8px 12px",
                        cursor: "pointer",
                    }}
                >
                    Download
                </button>

            </div>
        );
    };
    const DynamicFiltersComponent = () => {

        return (
            <>
                {filters.map((filter) => (

                    <DynamicFilter
                        key={filter.key}
                        filter={filter}
                        value={
                            filtersState[filter.key] ||
                            (
                                filter.type === "multi-select"
                                    ? []
                                    : ""
                            )
                        }
                        options={
                            filterOptions[filter.key] || []
                        }
                        // onChange={(value) => {

                        //     setFiltersState((prev) => ({
                        //         ...prev,
                        //         [filter.key]: value,
                        //     }));

                        //     setSkip(0);
                        // }}
                        onChange={(value) => {
                            setFiltersState((prev) => {
                                const resolvedValue =
                                    typeof value === "function"
                                        ? value(prev[filter.key] || [])
                                        : value;

                                return {
                                    ...prev,
                                    [filter.key]: resolvedValue,
                                };
                            });

                            setSkip(0);
                        }}
                    // onChange={(value) => {
                    //     const safeValue = typeof value === "function"
                    //         ? value([])
                    //         : value;

                    //     setFiltersState((prev) => ({
                    //         ...prev,
                    //         [filter.key]: Array.isArray(safeValue)
                    //             ? safeValue
                    //             : safeValue
                    //                 ? [safeValue]
                    //                 : [],
                    //     }));

                    //     setSkip(0);
                    // }}
                    />

                ))}
            </>
        );
    };
    return {
        data, loading, error, InpurLimitComponent, RenderSearchInputComponent, PaginationComponent,
        reportWrapperItems: {

            filters: [DynamicFiltersComponent, ClassFilterComponent, SectionFilterComponent, InpurLimitComponent, RenderSearchInputComponent, DownloadModeSelectComponent,],

            PaginationComponent,

            exportToExcel,
        },
        exportToExcel,
        handleSort,
        sortBy,
        sortOrder,
    };
};

export default useReportFetchWithFilter;