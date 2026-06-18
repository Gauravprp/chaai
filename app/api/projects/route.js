import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || '1';
    const employeeId = searchParams.get('employeeId');

    let cleanEmployeeId = employeeId;
    if (employeeId && employeeId.includes('-')) {
      const parts = employeeId.split('-');
      if (parts[1] === '0000' && parts[2] === '0000' && parts[3] === '0000') {
        const match = parts[0].match(/^([1-9][0-9]*|0)0*$/);
        if (match) {
          cleanEmployeeId = match[1];
        }
      }
    }

    let url = `https://api.dyzo.ai/project/company/${companyId}/`;
    if (cleanEmployeeId && cleanEmployeeId !== 'undefined' && cleanEmployeeId !== 'null') {
      url = `https://api.dyzo.ai/project/company/${companyId}/${cleanEmployeeId}/`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
      }
    });

    if (!response.ok) {
      throw new Error(`Dyzo projects fetch responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy error fetching projects:", err.message);
    return NextResponse.json({ status: 0, error: err.message }, { status: 500 });
  }
}
