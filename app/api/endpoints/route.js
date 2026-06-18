import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  try {
    const filePath = "C:\\Users\\gaurav\\.gemini\\antigravity-ide\\brain\\a11427f6-fef3-46a4-8ec1-c0c460c198ec\\.system_generated\\steps\\191\\content.md";
    const text = fs.readFileSync(filePath, 'utf-8');
    const jsonStart = text.indexOf('{');
    const json = JSON.parse(text.substring(jsonStart));
    
    const matches = [];
    for (const cat of json.documentation.categories) {
      for (const ep of cat.endpoints) {
        if (ep.methods) {
          for (const m of ep.methods) {
            if (m.url.includes('employee/list') || m.url.includes('employees')) {
              matches.push({
                category: cat.name,
                label: ep.label,
                method: m.method,
                url: m.url,
                title: m.title,
                requestPayload: m.requestPayload,
                responsePayload: m.responsePayload
              });
            }
          }
        }
      }
    }
    
    return NextResponse.json({ status: 1, matches });
  } catch (err) {
    return NextResponse.json({ status: 0, error: err.message });
  }
}
