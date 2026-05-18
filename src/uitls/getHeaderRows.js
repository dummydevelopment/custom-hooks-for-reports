export const getHeaderRows = (columns) => {
    const getMaxDepth = (cols) => {
        return Math.max(
            ...cols.map((col) =>
                col.children ? 1 + getMaxDepth(col.children) : 1
            )
        );
    };

    const countLeafColumns = (cols) => {
        return cols.reduce((acc, col) => {
            return acc + (col.children ? countLeafColumns(col.children) : 1);
        }, 0);
    };

    const buildHeaderRows = (cols, maxDepth, depth = 0, rows = []) => {
        rows[depth] = rows[depth] || [];

        cols.forEach((col) => {
            rows[depth].push({
                header: col.header,
                colSpan: col.children ? countLeafColumns(col.children) : 1,
                rowSpan: col.children ? 1 : maxDepth - depth,
            });

            if (col.children) {
                buildHeaderRows(col.children, maxDepth, depth + 1, rows);
            }
        });

        return rows;
    };

    const maxDepth = getMaxDepth(columns);
    return buildHeaderRows(columns, maxDepth);
};