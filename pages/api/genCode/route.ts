import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const generatedCode = ``;
  const fileStructure = ['index.html', 'styles.css', 'app.js'];
  const testResults = ['✅ index.html test passed', '❌ styles.css test failed'];

  return NextResponse.json({ generatedCode, fileStructure, testResults });
}
