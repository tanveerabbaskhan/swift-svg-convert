# 🚨 EMERGENCY DEPLOYMENT GUIDE

## CRITICAL: Your Live Server is Compromised

**STATUS:** Malicious script injection detected on live server
**ACTION:** Immediate full deployment required

---

## ⚡ IMMEDIATE STEPS (Do This NOW)

### 1. Backup Current Site (Optional)
```bash
# If you want to backup before cleaning
cp -r public_html public_html_backup
```

### 2. Complete Server Cleanup
```bash
# Access your server via FTP/SSH
# Navigate to your web root (usually public_html or www)

# DELETE EVERYTHING except these if they exist:
# - Database files
# - Configuration files you need
# - SSL certificates

# Remove all infected files
rm -rf public_html/*
```

### 3. Upload Clean Files
Upload ALL files from `dist/` folder to your server:

```
dist/
├── .htaccess          ← Upload this
├── assets/            ← Upload this folder
├── blog/              ← Upload this folder  
├── favicon.ico        ← Upload this
├── index.html         ← Upload this (CLEAN VERSION)
├── robots.txt         ← Upload this
├── sitemap.xml        ← Upload this
└── placeholder.svg    ← Upload this
```

### 4. Set Correct Permissions
```bash
# Set proper file permissions
chmod 644 index.html robots.txt sitemap.xml .htaccess
chmod 755 assets/ blog/
chmod 644 assets/* blog/*
```

---

## 🔍 VERIFICATION CHECKLIST

### After Deployment, Test These URLs:

1. **Homepage:** https://pngtosvgconverter.com/
   - ✅ Should load clean without suspicious scripts
   - ✅ Canonical: https://pngtosvgconverter.com/

2. **Blog Post:** https://pngtosvgconverter.com/blog/png-to-svg-converter-complete-guide
   - ✅ Should load clean without suspicious scripts
   - ✅ Canonical: https://pngtosvgconverter.com/blog/png-to-svg-converter-complete-guide
   - ✅ Title: "PNG to SVG Converter Complete Guide — PNGTOSVG"

3. **Blog HTML:** https://pngtosvgconverter.com/blog/png-to-svg-converter-complete-guide.html
   - ✅ Should load static HTML version
   - ✅ Should redirect to SPA after 1 second

4. **Sitemap:** https://pngtosvgconverter.com/sitemap.xml
   - ✅ Should show 7 URLs including both blog versions

---

## 🛡️ SECURITY HARDENING

### Change All Passwords:
- [ ] Hosting account password
- [ ] FTP/SFTP password  
- [ ] Database password
- [ ] Admin panel passwords

### Server Security:
- [ ] Update cPanel/Plesk
- [ ] Update PHP version
- [ ] Enable firewall
- [ ] Install malware scanner
- [ ] Enable file integrity monitoring

### Access Control:
- [ ] Use SFTP instead of FTP
- [ ] Limit IP access to admin
- [ ] Enable 2FA where possible
- [ ] Review server access logs

---

## 🚨 IF PROBLEMS PERSIST

### Still Seeing Malicious Script?
1. **Check .htaccess** for suspicious redirects
2. **Scan server** for hidden files: `find . -name ".*"`
3. **Check PHP files** for eval() or base64_decode
4. **Contact hosting provider** for security scan

### Canonical URL Still Wrong?
1. **Clear browser cache** (Ctrl+F5)
2. **Check browser dev tools** for script errors
3. **View page source** to verify clean HTML
4. **Wait 2-3 minutes** for JavaScript to load

---

## 📞 MONITORING

### Check These Every Hour for First 24 Hours:
- [ ] Homepage loads correctly
- [ ] Blog post canonical URL is correct
- [ ] No suspicious scripts in page source
- [ ] Google Search Console shows no errors

### Tools to Use:
- **Browser Dev Tools:** F12 → Network tab
- **View Source:** Right-click → View Page Source
- **GSC:** Google Search Console monitoring
- **Security:** `npm run security:audit`

---

## 🎯 SUCCESS INDICATORS

✅ **Homepage loads clean** with correct canonical  
✅ **Blog post shows correct canonical URL**  
✅ **No suspicious scripts** in page source  
✅ **All pages load correctly**  
✅ **Mobile responsive** works  
✅ **GSC shows no errors**  

---

## ⚠️ WARNING SIGNS

🚨 **Stop and Investigate If:**
- Suspicious scripts reappear
- Canonical URLs revert to homepage
- Pages redirect to unknown sites
- Server access logs show unusual activity
- Database has strange entries

---

## 🆘 EMERGENCY CONTACTS

If issues persist after deployment:
1. **Hosting Provider:** 24/7 support
2. **Security Professional:** For malware removal
3. **Google Support:** For indexing issues

---

## 📝 POST-DEPLOYMENT

### After 24 Hours:
- [ ] Submit sitemap to Google Search Console
- [ ] Request indexing for blog posts
- [ ] Monitor GSC for any issues
- [ ] Check search rankings

### After 1 Week:
- [ ] Full security audit
- [ ] Performance monitoring
- [ ] SEO ranking assessment
- [ ] Backup clean version

---

**🔥 CRITICAL: Deploy immediately! The longer the malicious script stays on your server, the more damage it can cause.**
