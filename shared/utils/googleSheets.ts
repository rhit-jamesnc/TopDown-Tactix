export const fetchReportedBugs = async () => {
  const SPREADSHEET_ID = '1AOulXUSF5f6MS-ZD-ZAkXnYdJ3skYVfBbBRoW938lfs';
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
  
  const response = await fetch(url);
  const text = await response.text();
  const json = JSON.parse(text.substring(47, text.length - 2));
  
  return json.table.rows.map((row: any) => ({
    id: row.c[0]?.v,
    timestamp: row.c[1]?.v,
    email: row.c[2]?.v,
    bug: row.c[3]?.v,
    status: row.c[4]?.v,
  }));
};