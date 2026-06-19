import { NextResponse } from 'next/server';

// Server-side proxy to bypass CORS restrictions
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || '1';

    const response = await fetch(`https://api.dyzo.ai/employee/list/${companyId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
      }
    });

    if (!response.ok) {
      throw new Error(`Dyzo backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (data && typeof data === 'object') {
      if (Array.isArray(data.employees)) {
        data.employees = data.employees.filter(emp => emp.isActive === true);
      }
      if (Array.isArray(data.data)) {
        data.data = data.data.filter(emp => emp.isActive === true);
      }
      if (Array.isArray(data.results)) {
        data.results = data.results.filter(emp => emp.isActive === true);
      }
      const prefixImage = (emp) => {
        const field = emp.profile_picture ? 'profile_picture' : (emp.profile_pic ? 'profile_pic' : (emp.profilePicture ? 'profilePicture' : null));
        if (field && emp[field] && typeof emp[field] === 'string' && !emp[field].startsWith('http')) {
          emp[field] = `https://api.dyzo.ai${emp[field].startsWith('/') ? '' : '/'}${emp[field]}`;
        }
        return emp;
      };
      if (Array.isArray(data.employees)) data.employees.map(prefixImage);
      if (Array.isArray(data.data)) data.data.map(prefixImage);
      if (Array.isArray(data.results)) data.results.map(prefixImage);
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy error fetching employees:", err.message);
    return NextResponse.json({ status: 0, error: err.message }, { status: 500 });
  }
}
