export const fetchReportedBugs = async () => {
    const SPREADSHEET_ID = '1AOulXUSF5f6MS-ZD-ZAkXnYdJ3skYVfBbBRoW938lfs';
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
  
    const response = await fetch(url);
    const text = await response.text();

    if (text.trim().startsWith('<')) {
        console.error("Received HTML instead of JSON. Ensure the Google Sheet is set to 'Anyone with the link can view'.");
        return []; 
    }

    const json = JSON.parse(text.substring(47, text.length - 2));
  
    return json.table.rows.map((row: any, index: number) => {
        const rawDate = row.c[0]?.v;
        let formattedDate = rawDate;

        if (typeof rawDate === 'string' && rawDate.startsWith('Date(')) {
            const dateParts = rawDate.match(/\d+/g)?.map(Number);
            if (dateParts) {
                const d = new Date(dateParts[0], dateParts[1], dateParts[2], dateParts[3], dateParts[4], dateParts[5]);
                formattedDate = d.toLocaleString();
            }
        }

        return {
            id: index,
            timestamp: formattedDate,
            email: row.c[1]?.v || '',
            bug: row.c[2]?.v || '',
            status: row.c[3]?.v || 'Active'
        };
    });
};

export const updateBugStatus = async (id: number, newStatus: string) => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAeGmjbhYBwrCg8AgtDgu6nplcK3rlXGmBn3-VUmWk3DpLzmwO7s8c2km749zl85uh/exec';
    
    await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
            action: 'update_status',
            id: id,
            status: newStatus
        })
    });
};