/**
 * Security Audit Script - Detects and removes malicious scripts
 * 
 * Usage: node scripts/security-audit.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(__dirname, "..");

function checkFileForSuspiciousContent(filePath) {
  if (!existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const issues = [];

    // Check for suspicious scripts
    const scriptRegex = /<script[^>]*src=['"][^'"]*['"][^>]*>/g;
    const scripts = content.match(scriptRegex) || [];
    
    scripts.forEach(script => {
      if (script.includes('pngtosvgconverter.com') && script.length > 100) {
        issues.push({
          type: 'SUSPICIOUS_SCRIPT',
          content: script,
          severity: 'HIGH'
        });
      }
    });

    // Check for suspicious iframe tags
    const iframeRegex = /<iframe[^>]*>/g;
    const iframes = content.match(iframeRegex) || [];
    
    iframes.forEach(iframe => {
      if (!iframe.includes('www.youtube.com') && !iframe.includes('player.vimeo.com')) {
        issues.push({
          type: 'SUSPICIOUS_IFRAME',
          content: iframe,
          severity: 'MEDIUM'
        });
      }
    });

    // Check for eval() usage
    if (content.includes('eval(')) {
      issues.push({
        type: 'EVAL_USAGE',
        content: 'eval() function found',
        severity: 'HIGH'
      });
    }

    // Check for document.write
    if (content.includes('document.write')) {
      issues.push({
        type: 'DOCUMENT_WRITE',
        content: 'document.write() found',
        severity: 'MEDIUM'
      });
    }

    // Check for base64 encoded content
    const base64Regex = /['"][A-Za-z0-9+/]{50,}={0,2}['"]/g;
    const base64Matches = content.match(base64Regex) || [];
    
    if (base64Matches.length > 0) {
      issues.push({
        type: 'BASE64_CONTENT',
        content: `Found ${base64Matches.length} base64 strings`,
        severity: 'LOW'
      });
    }

    return {
      file: filePath,
      issues,
      clean: issues.length === 0
    };
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

function scanProject() {
  console.log('🔍 Security Audit for PNGTOSVG Converter');
  console.log('==========================================\n');

  const filesToCheck = [
    'index.html',
    'public/index.html',
    'public/blog/png-to-svg-converter-complete-guide.html',
    'src/App.tsx',
    'src/main.tsx',
    'vite.config.ts'
  ];

  let totalIssues = 0;
  let highSeverityIssues = 0;

  filesToCheck.forEach(file => {
    const fullPath = resolve(projectDir, file);
    const result = checkFileForSuspiciousContent(fullPath);
    
    if (result) {
      console.log(`\n📁 Checking: ${file}`);
      
      if (result.clean) {
        console.log('   ✅ No security issues found');
      } else {
        console.log(`   ⚠️  Found ${result.issues.length} issue(s):`);
        
        result.issues.forEach(issue => {
          const icon = issue.severity === 'HIGH' ? '🚨' : issue.severity === 'MEDIUM' ? '⚠️' : 'ℹ️';
          console.log(`   ${icon} ${issue.type}: ${issue.content}`);
          
          if (issue.severity === 'HIGH') highSeverityIssues++;
          totalIssues++;
        });
      }
    }
  });

  console.log('\n' + '='.repeat(50));
  
  if (totalIssues === 0) {
    console.log('🎉 No security issues found!');
  } else {
    console.log(`⚠️  Found ${totalIssues} total security issue(s)`);
    if (highSeverityIssues > 0) {
      console.log(`🚨 ${highSeverityIssues} high-severity issue(s) require immediate attention`);
    }
    
    console.log('\n🛠️  Recommended Actions:');
    console.log('1. Remove any suspicious scripts immediately');
    console.log('2. Change all passwords (hosting, FTP, database)');
    console.log('3. Scan for malware on your local machine');
    console.log('4. Update all software and plugins');
    console.log('5. Enable file integrity monitoring');
    console.log('6. Review server access logs');
  }

  return { totalIssues, highSeverityIssues };
}

function generateCleanIndexHTML() {
  console.log('\n🔧 Generating clean index.html...');
  
  const cleanHTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Free PNG to SVG Converter Online — No Signup, No Watermark</title>
    <meta name="description" content="Convert PNG to SVG instantly with true vectorization — not fake Base64 embedding. Our free online tool uses AI-powered image tracing to preserve colors, sharp edges, and transparent backgrounds. No signup. No watermark. No limits." />
    <meta name="author" content="PNGTOSVG" />
    <meta name="robots" content="index, follow" />
    <meta name="google-site-verification" content="ZsbbYdnAKNqMrWxXeVfk9NgsMpZiTG5I-ZhOEeJoCyw" />
    <link rel="canonical" href="https://pngtosvgconverter.com/" />

    <meta property="og:title" content="Free PNG to SVG Converter Online — No Signup, No Watermark" />
    <meta property="og:description" content="Convert PNG to SVG instantly with true vectorization — not fake Base64 embedding. AI-powered image tracing preserves colors, sharp edges, and transparent backgrounds." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://pngtosvgconverter.com/" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Free PNG to SVG Converter Online — No Signup, No Watermark" />
    <meta name="twitter:description" content="Convert PNG to SVG instantly with true vectorization — not fake Base64 embedding. AI-powered image tracing preserves colors, sharp edges, and transparent backgrounds." />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PNGTOSVG",
      "url": "https://pngtosvgconverter.com",
      "description": "Free online PNG to SVG converter with bulk conversion support",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Any",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  const indexPath = resolve(projectDir, 'index.html');
  writeFileSync(indexPath, cleanHTML, 'utf-8');
  
  const publicIndexPath = resolve(projectDir, 'public', 'index.html');
  writeFileSync(publicIndexPath, cleanHTML, 'utf-8');
  
  console.log('✅ Clean index.html files generated');
}

// Main execution
const results = scanProject();

if (results.highSeverityIssues > 0) {
  console.log('\n🚨 HIGH SEVERITY ISSUES DETECTED!');
  console.log('Generating clean files...\n');
  generateCleanIndexHTML();
}

console.log('\n📚 Security Recommendations:');
console.log('1. Deploy the clean files immediately');
console.log('2. Monitor for any script re-injection');
console.log('3. Set up file integrity monitoring');
console.log('4. Regular security scans recommended');
