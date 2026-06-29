import { google } from 'googleapis';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Disable static caching for this page to always fetch latest

export default async function DashboardPage() {

  let records = [];
  let error = null;

  try {
    const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!credentialsJson || !spreadsheetId) {
      throw new Error('Google Sheets configuration is missing.');
    }

    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Fetch all records
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:Z', // Assumes data is in Sheet1
    });

    const rows = response.data.values;
    if (rows && rows.length > 0) {
      records = rows;
    }
  } catch (err) {
    console.error('Error fetching records:', err);
    error = 'Failed to load records from Google Sheets.';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">Records Dashboard</h1>
          <a href="/" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-sm font-medium transition-colors">
            Back to Home
          </a>
        </div>
        
        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}
          
          {!error && records.length === 0 && (
            <p className="text-gray-500 text-center py-10">No records found.</p>
          )}

          {records.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-700">
                    {records[0].map((col, idx) => (
                      <th key={idx} className="p-4 font-semibold text-sm">
                        Column {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-4 text-gray-700 text-sm whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
