// Script to update the fallback blog posts in the sitemap generator
// This helps when environment variables are not available during build

const fs = require('fs');
const path = require('path');

// Read the current sitemap script
const scriptPath = path.join(__dirname, 'scripts', 'generate-sitemap.mjs');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// You can update these fallback blog posts based on your actual published posts
const fallbackPosts = [
  { slug: "png-to-svg-converter-complete-guide", updated_at: "2026-03-24T00:00:00Z", noindex: false },
  // Add more posts here as needed
];

console.log('Current fallback posts in sitemap generator:');
console.log('You can update the generate-sitemap.mjs file to add your actual blog posts');
console.log('Fallback posts currently included:', fallbackPosts.length);
