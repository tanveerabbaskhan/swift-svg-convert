/**
 * Verification script to check if SEO setup is complete and working
 * 
 * Usage: node scripts/verify-seo-setup.mjs
 */

import { existsSync, readFileSync, statSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");

function checkFile(filePath, description) {
  const fullPath = resolve(publicDir, filePath);
  const exists = existsSync(fullPath);
  
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  
  if (exists) {
    try {
      const stats = statSync(fullPath);
      console.log(`   📁 Size: ${(stats.size / 1024).toFixed(1)}KB`);
      console.log(`   📅 Modified: ${stats.mtime.toISOString().split('T')[0]}`);
    } catch (error) {
      console.log(`   ⚠️  Could not read file stats`);
    }
  }
  
  return exists;
}

function checkSitemap() {
  console.log('\n🗺️  Checking Sitemap...');
  
  const sitemapPath = resolve(publicDir, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    console.log('❌ Sitemap not found');
    return false;
  }
  
  try {
    const content = readFileSync(sitemapPath, 'utf-8');
    const urlMatches = content.match(/<loc>(.*?)<\/loc>/g) || [];
    
    console.log(`✅ Sitemap found with ${urlMatches.length} URLs`);
    
    // Check for blog post pairs
    const blogUrls = urlMatches.filter(url => url.includes('/blog/'));
    const htmlUrls = blogUrls.filter(url => url.includes('.html'));
    const spaUrls = blogUrls.filter(url => !url.includes('.html'));
    
    console.log(`   📝 Blog SPA URLs: ${spaUrls.length}`);
    console.log(`   📄 Blog HTML URLs: ${htmlUrls.length}`);
    
    if (spaUrls.length === htmlUrls.length) {
      console.log(`   ✅ Perfect pairing - each blog post has both SPA and HTML versions`);
    } else {
      console.log(`   ⚠️  Mismatch in URL pairs`);
    }
    
    blogUrls.forEach(url => {
      const cleanUrl = url.replace(/<loc>|<\/loc>/g, '');
      console.log(`   📌 ${cleanUrl}`);
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Error reading sitemap: ${error.message}`);
    return false;
  }
}

function checkBlogFiles() {
  console.log('\n📝 Checking Blog HTML Files...');
  
  const blogDir = resolve(publicDir, 'blog');
  if (!existsSync(blogDir)) {
    console.log('❌ Blog directory not found');
    return false;
  }
  
  try {
    const files = readdirSync(blogDir).filter(f => f.endsWith('.html'));
    
    console.log(`✅ Found ${files.length} blog HTML files:`);
    
    files.forEach(file => {
      const filePath = resolve(blogDir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const hasTitle = content.includes('<title>');
        const hasDescription = content.includes('name="description"');
        const hasStructuredData = content.includes('application/ld+json');
        const hasRedirect = content.includes('http-equiv="refresh"');
        
        console.log(`   📄 ${file}`);
        console.log(`      ✅ Title: ${hasTitle ? 'Yes' : 'No'}`);
        console.log(`      ✅ Description: ${hasDescription ? 'Yes' : 'No'}`);
        console.log(`      ✅ Structured Data: ${hasStructuredData ? 'Yes' : 'No'}`);
        console.log(`      ✅ Auto-redirect: ${hasRedirect ? 'Yes' : 'No'}`);
        
        if (!hasTitle || !hasDescription || !hasStructuredData || !hasRedirect) {
          console.log(`      ⚠️  Missing some SEO elements`);
        }
      } catch (error) {
        console.log(`   ❌ Error reading ${file}: ${error.message}`);
      }
    });
    
    return files.length > 0;
  } catch (error) {
    console.log(`❌ Error reading blog directory: ${error.message}`);
    return false;
  }
}

function checkRobots() {
  console.log('\n🤖 Checking robots.txt...');
  
  const robotsPath = resolve(publicDir, 'robots.txt');
  if (!existsSync(robotsPath)) {
    console.log('❌ robots.txt not found');
    return false;
  }
  
  try {
    const content = readFileSync(robotsPath, 'utf-8');
    const allowsBlog = content.includes('Allow: /blog/*.html');
    const disallowsAdmin = content.includes('Disallow: /admin/');
    const hasSitemap = content.includes('Sitemap:');
    
    console.log(`✅ robots.txt found`);
    console.log(`   ✅ Allows blog HTML files: ${allowsBlog ? 'Yes' : 'No'}`);
    console.log(`   ✅ Disallows admin: ${disallowsAdmin ? 'Yes' : 'No'}`);
    console.log(`   ✅ Has sitemap reference: ${hasSitemap ? 'Yes' : 'No'}`);
    
    return allowsBlog && disallowsAdmin && hasSitemap;
  } catch (error) {
    console.log(`❌ Error reading robots.txt: ${error.message}`);
    return false;
  }
}

function checkHtaccess() {
  console.log('\n🔧 Checking .htaccess...');
  
  const htaccessPath = resolve(publicDir, '.htaccess');
  if (!existsSync(htaccessPath)) {
    console.log('❌ .htaccess not found');
    return false;
  }
  
  try {
    const content = readFileSync(htaccessPath, 'utf-8');
    const hasRewriteEngine = content.includes('RewriteEngine On');
    const hasBlogRule = content.includes('RewriteRule ^blog/([^/]+)$');
    const hasSpaFallback = content.includes('RewriteRule ^ /index.html');
    
    console.log(`✅ .htaccess found`);
    console.log(`   ✅ Rewrite engine enabled: ${hasRewriteEngine ? 'Yes' : 'No'}`);
    console.log(`   ✅ Blog routing rule: ${hasBlogRule ? 'Yes' : 'No'}`);
    console.log(`   ✅ SPA fallback rule: ${hasSpaFallback ? 'Yes' : 'No'}`);
    
    return hasRewriteEngine && hasBlogRule && hasSpaFallback;
  } catch (error) {
    console.log(`❌ Error reading .htaccess: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 SEO Setup Verification');
  console.log('========================\n');
  
  let allGood = true;
  
  // Check essential files
  allGood &= checkFile('index.html', 'Main HTML file');
  allGood &= checkFile('robots.txt', 'Robots file');
  allGood &= checkFile('.htaccess', 'Apache configuration');
  allGood &= checkFile('sitemap.xml', 'Sitemap');
  
  // Check sitemap details
  allGood &= checkSitemap();
  
  // Check blog files
  allGood &= checkBlogFiles();
  
  // Check robots.txt details
  allGood &= checkRobots();
  
  // Check .htaccess details
  allGood &= checkHtaccess();
  
  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log('🎉 All checks passed! Your SEO setup is complete.');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy your site to production');
    console.log('2. Submit sitemap to Google Search Console');
    console.log('3. Request indexing for your blog posts');
    console.log('4. Monitor GSC for indexing status');
  } else {
    console.log('⚠️  Some issues found. Please review the checks above.');
    console.log('\n🔧 To fix issues:');
    console.log('1. Run: npm run generate:blog-static');
    console.log('2. Verify all files are generated correctly');
    console.log('3. Check file permissions on your server');
  }
  
  console.log('\n📚 For detailed guidance, see: DEPLOYMENT_GUIDE.md');
}

main();
