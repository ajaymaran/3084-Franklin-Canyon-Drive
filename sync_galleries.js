const fs = require('fs');
const path = require('path');

const dir = __dirname;
const imagesDir = path.join(dir, 'images');

// Helper to convert "Living Room" to "living-room" for URLs
function toUrl(folderName) {
    return folderName.toLowerCase().replace(/\s+/g, '-');
}

// 1. Get Nav HTML from index.html instead of generating it
const indexContent = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const navMatch = indexContent.match(/<nav[^>]*>[\s\S]*?<\/nav>/i);
const fullNavHtml = navMatch ? navMatch[0] : '';

// Parse folders for page generation
const folders = fs.readdirSync(imagesDir).filter(f => fs.statSync(path.join(imagesDir, f)).isDirectory());
let pagesToGenerate = []; 

folders.forEach(folder => {
    const folderAbsPath = path.join(imagesDir, folder);
    const subitems = fs.readdirSync(folderAbsPath).filter(f => fs.statSync(path.join(folderAbsPath, f)).isDirectory());
    
    if (subitems.length > 0) {
        subitems.forEach(sub => {
            pagesToGenerate.push({
                folderPath: `${folder}/${sub}`,
                title: sub,
                url: toUrl(sub)
            });
        });
    } else {
        pagesToGenerate.push({
            folderPath: folder,
            title: folder,
            url: toUrl(folder)
        });
    }
});

// 1.5 Auto-create missing HTML files from template
pagesToGenerate.forEach(page => {
    const expectedHtmlPath = path.join(dir, `${page.url}.html`);
    if (!fs.existsSync(expectedHtmlPath)) {
        let templateContent = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
        
        templateContent = templateContent.replace(/<title>.*?<\/title>/i, `<title>3084 Franklin Canyon Drive | ${page.title}</title>`);
        templateContent = templateContent.replace(/<h1[^>]*>.*?<\/h1>/i, `<h1 style="font-size: 1.6rem; font-weight: 500; font-family: var(--font-heading); margin-bottom: 0.25rem;">${page.title}</h1>`);
        templateContent = templateContent.replace(/<h2 class="detail-room-title">.*?<\/h2>/i, `<h2 class="detail-room-title">${page.title}</h2>`);
        
        templateContent = templateContent.replace(/data-folder="[^"]*"/i, `data-folder="images/${page.folderPath}/"`);
        
        fs.writeFileSync(expectedHtmlPath, templateContent, 'utf8');
        console.log(`Created HTML file: ${page.url}.html`);
    }
});

// 2. Update HTML Files
const allHtmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const navRegex = /(<nav[^>]*>)[\s\S]*?(<\/nav>)/i;

for (const file of allHtmlFiles) {
    // Skip template.html itself
    if (file === 'template.html') continue;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Inject Nav HTML
    if (content.match(navRegex)) {
        content = content.replace(navRegex, fullNavHtml);
    }

    // Sync Galleries (only for detail pages, not index)
    if (file !== 'index.html') {
        const blockRegex = /(<div class="gallery-slides" data-folder="([^"]*)">)[\s\S]*?(<button class="gallery-control-prev")/i;
        const match = content.match(blockRegex);
        
        if (match) {
            const folderPath = match[2]; 
            const absoluteFolderPath = path.join(dir, folderPath);
            
            if (fs.existsSync(absoluteFolderPath)) {
                const images = fs.readdirSync(absoluteFolderPath).filter(f => f.match(/\.(png|jpe?g|gif|webp)$/i));
                
                let slidesHtml = `\n`;
                images.forEach((imgFile, index) => {
                    const rawName = imgFile.replace(/\.[^/.]+$/, "");
                    
                    const isActive = index === 0 ? 'active' : '';
                    slidesHtml += `                        <div class="gallery-slide ${isActive}">\n`;
                    slidesHtml += `                            <div class="slide-image-wrapper">\n`;
                    slidesHtml += `                                <img src="${folderPath}${imgFile}" alt="3084 Franklin Canyon Drive Dynamic View">\n`;
                    slidesHtml += `                                <div class="gallery-slide-caption">${rawName}</div>\n`;
                    slidesHtml += `                            </div>\n`;
                    slidesHtml += `                        </div>\n`;
                });
                
                const newHtml = `<div class="gallery-slides" data-folder="${folderPath}">${slidesHtml}                    </div>\n                    $3`;
                content = content.replace(blockRegex, newHtml);
            }
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
}
console.log("SSG Sync complete! Nav Bars updated from index.html and all HTML files populated with latest images.");
