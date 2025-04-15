export const generateCodeAI = async (prompt: string) => {
    // Replace with your AI model's code
    const generatedCode = `Generated HTML, CSS, JavaScript code for: ${prompt}`;
    const fileStructure = ["index.html", "style.css", "app.js"]; // Simulated files
    const testResults = ["✅ Navbar.test.tsx passed", "❌ Form.test.tsx failed"];
  
    return { generatedCode, fileStructure, testResults };
  };
  