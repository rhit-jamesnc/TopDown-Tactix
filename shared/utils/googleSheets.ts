export const fetchReportedBugs = async () => {
    const SPREADSHEET_ID = '1AOulXUSF5f6MS-ZD-ZAkXnYdJ3skYVfBbBRoW938lfs';
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
  
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
  
    return json.table.rows.map((row: any, index: number) => ({
        id: index,
        timestamp: row.c[0]?.v || '',
        email: row.c[1]?.v || '',
        bug: row.c[2]?.v || '',
        status: 'Active',
    }));
};