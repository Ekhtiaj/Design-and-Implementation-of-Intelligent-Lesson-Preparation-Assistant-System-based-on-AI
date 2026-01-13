document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

async function generateLessonPlan() {
    const topic = document.getElementById('lesson-plan-input').value.trim();
    if (!topic) return showError('lesson-plan-output', 'Please enter a topic');
    
    await generateAIResponse({
        input: topic,
        outputElement: 'lesson-plan-output',
        promptTemplate: PROMPT_TEMPLATES.lessonPlan(topic),
        loadingText: 'Creating your customized lesson plan...'
    });
}

async function generateExercises() {
    const topic = document.getElementById('exercise-input').value.trim();
    if (!topic) return showError('exercise-output', 'Please enter a topic');
    
    await generateAIResponse({
        input: topic,
        outputElement: 'exercise-output',
        promptTemplate: PROMPT_TEMPLATES.exercises(topic),
        loadingText: 'Generating targeted practice exercises...'
    });
}

async function generatePPT() {
    const topic = document.getElementById('ppt-topic-input').value.trim();
    const numSlides = parseInt(document.getElementById('ppt-slides-input').value) || 8;
    const depthLevel = document.getElementById('ppt-depth-select').value;
    const language = document.getElementById('ppt-language-select').value;
    const teachingLevel = document.getElementById('ppt-level-select').value;
    
    if (!topic) return showError('ppt-generator-output', 'Please enter a topic');
    
    if (numSlides < 3 || numSlides > 12) {
        return showError('ppt-generator-output', 'Number of slides must be between 3 and 12');
    }
    
    const output = document.getElementById('ppt-generator-output');
    output.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Generating PowerPoint presentation outline...
        </div>
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "Intelligent Lesson Preparation Assistant"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [{
                    "role": "user",
                    "content": PROMPT_TEMPLATES.pptGenerator(topic, numSlides, depthLevel, language, teachingLevel)
                }]
            })
        });
        
        const data = await response.json();
        const result = data.choices[0].message.content;
        
        // Display the markdown content
        output.innerHTML = marked.parse(result);
        addCopyButton('ppt-generator-output');
        
        // Generate and add download button for PPTX file (async)
        generatePPTXFile(result, topic).catch(error => {
            console.error('Error generating PPTX:', error);
            const output = document.getElementById('ppt-generator-output');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error';
            errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error generating PPTX: ${error.message}`;
            errorMsg.style.marginTop = '15px';
            output.appendChild(errorMsg);
        });
        
    } catch (error) {
        output.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> Error: ${error.message}
            </div>
        `;
    }
}

// Function to fetch image from Unsplash API
async function fetchUnsplashImage(searchQuery) {
    try {
        if (typeof UNSPLASH_ACCESS_KEY === 'undefined' || !UNSPLASH_ACCESS_KEY) {
            return null;
        }
        
        // Clean search query
        const query = searchQuery.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 50);
        if (!query || query.length < 3) {
            return null;
        }
        
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });
        
        if (!response.ok) {
            console.error('Unsplash API error:', response.status);
            return null;
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Return regular size image URL
            return data.results[0].urls.regular || data.results[0].urls.small;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching from Unsplash:', error);
        return null;
    }
}

// Function to generate PPTX file from markdown content
async function generatePPTXFile(markdownContent, topic) {
    try {
        const pptx = new PptxGenJS();
        
        // Set professional presentation properties
        pptx.layout = 'LAYOUT_16x9'; // Standard widescreen format
        pptx.author = "Intelligent Lesson Preparation Assistant";
        pptx.company = "AI Lesson Prep System";
        pptx.title = topic;
        pptx.subject = "Educational Presentation";
        
        // Define professional slide master with consistent styling
        pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: 'FFFFFF' },
            objects: [
                // Header bar
                {
                    rect: {
                        x: 0,
                        y: 0,
                        w: '100%',
                        h: 0.3,
                        fill: { color: '1F6FEB' },
                        line: { color: '1F6FEB' }
                    }
                },
                // Footer bar
                {
                    rect: {
                        x: 0,
                        y: 7.2,
                        w: '100%',
                        h: 0.3,
                        fill: { color: '1F6FEB' },
                        line: { color: '1F6FEB' }
                    }
                }
            ]
        });
        
        // Parse markdown content to extract slides with better structure
        // Try simple parser first, fallback to improved parser
        let slides;
        try {
            // Use the simple, more reliable parser
            if (typeof parseMarkdownToSlidesSimple !== 'undefined') {
                slides = parseMarkdownToSlidesSimple(markdownContent);
            } else {
                slides = parseMarkdownToSlidesImproved(markdownContent);
            }
        } catch (e) {
            console.error('Parser error:', e);
            slides = parseMarkdownToSlidesImproved(markdownContent);
        }
        
        // Ensure we have slides
        if (!slides || slides.length === 0) {
            slides = [{
                title: topic,
                isTitleSlide: true,
                sections: [{
                    bulletPoints: [
                        { text: 'Content generation in progress', indentLevel: 0 },
                        { text: 'Please check the markdown output above', indentLevel: 0 }
                    ]
                }]
            }];
        }
        
        // Create slides with images (async to fetch images)
        for (let index = 0; index < slides.length; index++) {
            const slide = slides[index];
            // Use master slide for consistency (except title slide)
            const pptxSlide = index === 0 && slide.isTitleSlide 
                ? pptx.addSlide() 
                : pptx.addSlide('MASTER_SLIDE');
            
            // Determine if this slide should have an image
            // Add images to slides that would benefit from visual content
            // Strategy: Add to every 2nd or 3rd slide, or slides with visual keywords
            const visualKeywords = ['culture', 'tradition', 'history', 'art', 'food', 'festival', 
                                   'celebration', 'landmark', 'architecture', 'nature', 'landscape',
                                   'people', 'ceremony', 'custom', 'practice', 'example', 'illustration'];
            const slideTitleLower = (slide.title || '').toLowerCase();
            const hasVisualKeyword = visualKeywords.some(keyword => slideTitleLower.includes(keyword));
            
            const shouldAddImage = !slide.isTitleSlide && 
                                  index > 0 && 
                                  slide.title && 
                                  slide.title.length > 5 &&
                                  (hasVisualKeyword || index % 2 === 0 || index % 3 === 0);
            
            let imageUrl = null;
            if (shouldAddImage && typeof UNSPLASH_ACCESS_KEY !== 'undefined' && UNSPLASH_ACCESS_KEY) {
                try {
                    // Generate search query from slide title and topic
                    const searchQuery = (slide.title + ' ' + topic).substring(0, 50);
                    imageUrl = await fetchUnsplashImage(searchQuery);
                } catch (error) {
                    console.error('Error fetching Unsplash image:', error);
                }
            }
            
            // Add title slide (first slide with main title)
            if (index === 0 && slide.isTitleSlide) {
                // Professional title slide with gradient background effect
                pptxSlide.background = { color: 'F6F8FA' };
                
                // Try to get a relevant image for the title slide
                let titleImageUrl = null;
                if (typeof UNSPLASH_ACCESS_KEY !== 'undefined' && UNSPLASH_ACCESS_KEY) {
                    try {
                        titleImageUrl = await fetchUnsplashImage(topic);
                    } catch (error) {
                        console.error('Error fetching title image:', error);
                    }
                }
                
                // Main title
                pptxSlide.addText(slide.title, {
                    x: 0.5,
                    y: titleImageUrl ? 1.5 : 2.8,
                    w: 9,
                    h: 1.2,
                    fontSize: 54,
                    bold: true,
                    color: "1F6FEB",
                    align: "center",
                    valign: "middle",
                    fontFace: "Arial"
                });
                
                // Subtitle or author info
                if (slide.subtitle) {
                    pptxSlide.addText(slide.subtitle, {
                        x: 0.5,
                        y: titleImageUrl ? 2.8 : 4.2,
                        w: 9,
                        h: 0.6,
                        fontSize: 28,
                        color: "6E7681",
                        align: "center",
                        fontFace: "Arial"
                    });
                } else {
                    pptxSlide.addText("Intelligent Lesson Preparation Assistant", {
                        x: 0.5,
                        y: titleImageUrl ? 3.5 : 4.8,
                        w: 9,
                        h: 0.5,
                        fontSize: 20,
                        color: "8B949E",
                        align: "center",
                        italic: true,
                        fontFace: "Arial"
                    });
                }
                
                // Add background image to title slide if available
                if (titleImageUrl) {
                    try {
                        pptxSlide.addImage({
                            path: titleImageUrl,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 7.5,
                            sizing: { type: 'cover' },
                            opacity: 0.15
                        });
                    } catch (error) {
                        console.error('Error adding title image:', error);
                    }
                }
            } else {
                // Regular content slide with professional formatting
                let currentY = 0.6; // Start below header
                
                // Add slide title with professional styling
                if (slide.title) {
                    pptxSlide.addText(slide.title, {
                        x: 0.5,
                        y: currentY,
                        w: 9,
                        h: 0.7,
                        fontSize: 32,
                        bold: true,
                        color: "1F6FEB",
                        align: "left",
                        fontFace: "Arial",
                        valign: "top"
                    });
                    currentY += 0.8; // Reduced spacing
                }
                
                // Add content sections
                if (slide.sections && slide.sections.length > 0) {
                    for (let sectionIndex = 0; sectionIndex < slide.sections.length; sectionIndex++) {
                        const section = slide.sections[sectionIndex];
                        // Add section title if exists (sub-heading)
                        if (section.title) {
                            pptxSlide.addText(section.title, {
                                x: 0.5,
                                y: currentY,
                                w: 9,
                                h: 0.5,
                                fontSize: 24,
                                bold: true,
                                color: "24292F",
                                align: "left",
                                fontFace: "Arial"
                            });
                            currentY += 0.5;
                        }
                        
                        // Add bullet points with proper nesting and professional formatting
                        if (section.bulletPoints && section.bulletPoints.length > 0) {
                            // Clean and filter bullet points
                            const cleanedBullets = [];
                            
                            section.bulletPoints.forEach((pointObj) => {
                                // Handle both object format (with indentLevel) and string format
                                let bulletText, indentLevel;
                                
                                if (typeof pointObj === 'object' && pointObj.text !== undefined) {
                                    bulletText = pointObj.text;
                                    indentLevel = pointObj.indentLevel || 0;
                                } else {
                                    bulletText = pointObj;
                                    indentLevel = 0;
                                }
                                
                                // Clean markdown formatting
                                let clean = bulletText.replace(/\*\*(.+?)\*\*/g, '$1');
                                clean = clean.replace(/\*(.+?)\*/g, '$1');
                                clean = clean.replace(/`(.+?)`/g, '$1');
                                clean = clean.trim();
                                
                                // Remove any label text
                                const cleanLower = clean.toLowerCase();
                                if (cleanLower.match(/^(slide\s+title|bullet\s+points?|title|subtitle|presenter):?\s*$/) ||
                                    cleanLower.startsWith('slide title:') ||
                                    cleanLower.startsWith('bullet points:') ||
                                    clean.length < 3) {
                                    return; // Skip this bullet point
                                }
                                
                                cleanedBullets.push({ text: clean, indentLevel: indentLevel });
                            });
                            
                            if (cleanedBullets.length > 0) {
                                // Build text array following PptxGenJS documentation format
                                // Each item only needs bullet and indentLevel in options
                                const textArray = cleanedBullets.map(bullet => ({
                                    text: bullet.text,
                                    options: {
                                        bullet: true,
                                        indentLevel: bullet.indentLevel
                                    }
                                }));
                                
                                // Calculate available height
                                const availableHeight = Math.max(4, 6.8 - currentY);
                                
                                // Adjust width if we're adding an image
                                const textWidth = imageUrl ? 5.5 : 9;
                                
                                // Add text with bullets - common options go in the main options object
                                pptxSlide.addText(textArray, {
                                    x: 0.5,
                                    y: currentY,
                                    w: textWidth,
                                    h: availableHeight,
                                    fontSize: 20,
                                    color: "24292F",
                                    valign: "top",
                                    fontFace: "Arial",
                                    lineSpacing: 18,
                                    paraSpaceAfter: 2,
                                    paraSpaceBefore: 1
                                });
                                
                                // Add image on the right side if available (only once per slide)
                                if (imageUrl && sectionIndex === 0) {
                                    try {
                                        pptxSlide.addImage({
                                            path: imageUrl,
                                            x: 6.5,
                                            y: currentY,
                                            w: 3.0,
                                            h: 3.5,
                                            sizing: { type: 'contain', w: 3.0, h: 3.5 }
                                        });
                                    } catch (error) {
                                        console.error('Error adding image to slide:', error);
                                    }
                                }
                            }
                        }
                        
                        // Add paragraph text if exists (show even if bullets exist, as additional content)
                        if (section.paragraph && section.paragraph.length > 5) {
                            let cleanParagraph = section.paragraph
                                .replace(/\*\*(.+?)\*\*/g, '$1')
                                .replace(/\*(.+?)\*/g, '$1')
                                .replace(/`(.+?)`/g, '$1')
                                .trim();
                            
                            // Remove label text from paragraphs
                            cleanParagraph = cleanParagraph
                                .replace(/slide\s+title:?\s*/gi, '')
                                .replace(/bullet\s+points?:?\s*/gi, '')
                                .trim();
                            
                            if (cleanParagraph && cleanParagraph.length > 5) {
                                // Adjust Y position if we already added bullets
                                const paraY = section.bulletPoints && section.bulletPoints.length > 0 
                                    ? currentY + (section.bulletPoints.length * 0.4) 
                                    : currentY;
                                
                                // Adjust width if we're adding an image
                                const paraWidth = imageUrl ? 5.5 : 9;
                                
                                pptxSlide.addText(cleanParagraph, {
                                    x: 0.5,
                                    y: paraY,
                                    w: paraWidth,
                                    h: 6.8 - paraY,
                                    fontSize: 20,
                                    color: "24292F",
                                    valign: "top",
                                    fontFace: "Arial",
                                    lineSpacing: 18,
                                    align: "left"
                                });
                                
                                // Image already added with bullets, skip here
                            }
                        }
                        
                        // If section has no content at all, add a placeholder
                        if ((!section.bulletPoints || section.bulletPoints.length === 0) && 
                            (!section.paragraph || section.paragraph.length < 5)) {
                            pptxSlide.addText("Content for this section", {
                                x: 0.5,
                                y: currentY,
                                w: 9,
                                h: 1,
                                fontSize: 18,
                                color: "888888",
                                italic: true,
                                fontFace: "Arial"
                            });
                        }
                    }
                } else if (slide.bulletPoints && slide.bulletPoints.length > 0) {
                    // Fallback: simple bullet points with professional nesting support
                    const cleanedBullets = [];
                    
                    slide.bulletPoints.forEach((pointObj) => {
                        let bulletText, indentLevel;
                        
                        if (typeof pointObj === 'object' && pointObj.text !== undefined) {
                            bulletText = pointObj.text;
                            indentLevel = pointObj.indentLevel || 0;
                        } else {
                            bulletText = pointObj;
                            indentLevel = 0;
                        }
                        
                        let clean = bulletText.replace(/\*\*(.+?)\*\*/g, '$1');
                        clean = clean.replace(/\*(.+?)\*/g, '$1');
                        clean = clean.replace(/`(.+?)`/g, '$1');
                        clean = clean.trim();
                        
                        const cleanLower = clean.toLowerCase();
                        if (cleanLower.match(/^(slide\s+title|bullet\s+points?|title|subtitle|presenter):?\s*$/) ||
                            cleanLower.startsWith('slide title:') ||
                            cleanLower.startsWith('bullet points:') ||
                            clean.length < 3) {
                            return;
                        }
                        
                        cleanedBullets.push({ text: clean, indentLevel: indentLevel });
                    });
                    
                    if (cleanedBullets.length > 0) {
                        // Build text array following PptxGenJS documentation format
                        const textArray = cleanedBullets.map(bullet => ({
                            text: bullet.text,
                            options: {
                                bullet: true,
                                indentLevel: bullet.indentLevel
                            }
                        }));
                        
                        // Adjust width if we're adding an image
                        const textWidth = imageUrl ? 5.5 : 9;
                        
                        pptxSlide.addText(textArray, {
                            x: 0.5,
                            y: currentY,
                            w: textWidth,
                            h: 6.8 - currentY,
                            fontSize: 20,
                            color: "24292F",
                            valign: "top",
                            fontFace: "Arial",
                            lineSpacing: 18,
                            paraSpaceAfter: 2,
                            paraSpaceBefore: 1
                        });
                        
                        // Add image on the right side if available
                        if (imageUrl) {
                            try {
                                pptxSlide.addImage({
                                    path: imageUrl,
                                    x: 6.5,
                                    y: currentY,
                                    w: 3.0,
                                    h: 3.5,
                                    sizing: { type: 'contain', w: 3.0, h: 3.5 }
                                });
                            } catch (error) {
                                console.error('Error adding image to slide:', error);
                            }
                        }
                    }
                }
            }
        }
        
        // Generate filename
        const filename = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_presentation.pptx';
        
        // Remove existing download button if any
        const output = document.getElementById('ppt-generator-output');
        const existingBtn = output.querySelector('.download-ppt-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-ppt-btn';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PPTX';
        downloadBtn.style.cssText = `
            margin-top: 15px;
            padding: 12px 24px;
            background: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
        `;
        downloadBtn.onmouseover = function() {
            this.style.background = '#1557b0';
            this.style.transform = 'translateY(-1px)';
        };
        downloadBtn.onmouseout = function() {
            this.style.background = 'var(--secondary-color)';
            this.style.transform = 'translateY(0)';
        };
        downloadBtn.onclick = () => {
            pptx.writeFile({ fileName: filename });
        };
        
        output.appendChild(downloadBtn);
        
    } catch (error) {
        console.error('Error generating PPTX:', error);
        const output = document.getElementById('ppt-generator-output');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error generating PPTX file: ${error.message}`;
        errorMsg.style.marginTop = '15px';
        output.appendChild(errorMsg);
    }
}

// Improved function to parse markdown content and extract slide information
// This version is more comprehensive and captures ALL content
function parseMarkdownToSlidesImproved(markdownContent) {
    const slides = [];
    const lines = markdownContent.split('\n');
    
    let currentSlide = null;
    let currentSection = null;
    let slideNumber = 0;
    let isTitleSlide = false;
    
    // Helper function to clean text
    const cleanText = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\[.*?\]/g, '')
            .trim();
    };
    
    // Helper function to check if text is a label (be more strict)
    const isLabel = (text) => {
        if (!text) return true;
        const lower = text.toLowerCase().trim();
        // Only match exact label patterns
        return lower === 'slide title:' ||
               lower === 'bullet points:' ||
               lower === 'title:' ||
               lower === 'subtitle:' ||
               lower === 'presenter:' ||
               lower.match(/^(slide\s+title|bullet\s+points?|title|subtitle|presenter):?\s*$/);
    };
    
    // Helper to ensure current slide has a section
    const ensureSection = () => {
        if (!currentSlide) return;
        if (!currentSection) {
            currentSection = { bulletPoints: [], paragraph: null };
        }
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const originalLine = lines[i];
        
        // Skip completely empty lines
        if (!line) continue;
        
        // Check for main presentation title (# Title)
        if (line.startsWith('# ') && !line.startsWith('##')) {
            // Save previous slide if exists
            if (currentSlide) {
                if (currentSection && (currentSection.bulletPoints.length > 0 || currentSection.paragraph)) {
                    if (!currentSlide.sections) currentSlide.sections = [];
                    currentSlide.sections.push(currentSection);
                }
                slides.push(currentSlide);
            }
            
            let title = line.replace(/^#\s+/, '').replace(/Presentation\s+Title:?\s*/i, '').trim();
            title = title.replace(/\[.*?\]/g, '').trim();
            
            if (title && title.length > 0) {
                currentSlide = {
                    title: title,
                    isTitleSlide: true,
                    sections: []
                };
                isTitleSlide = true;
                slideNumber++;
                currentSection = null;
            }
            continue;
        }
        
        // Check for slide headers (## Slide X: Title)
        if (line.startsWith('## Slide')) {
            // Save previous slide if exists
            if (currentSlide) {
                if (currentSection && (currentSection.bulletPoints.length > 0 || currentSection.paragraph)) {
                    if (!currentSlide.sections) currentSlide.sections = [];
                    currentSlide.sections.push(currentSection);
                }
                slides.push(currentSlide);
            }
            
            // Extract title from header
            const titleMatch = line.match(/##\s+Slide\s+\d+:?\s*(.+)/);
            let title = titleMatch ? titleMatch[1] : line.replace(/##\s+Slide\s+\d+:?\s*/, '').trim();
            title = title.replace(/^Slide\s+\d+:?\s*/i, '').trim();
            // Remove any label text from title
            title = title.replace(/slide\s+title:?\s*/gi, '').trim();
            
            // Handle special slide types
            if (title.toLowerCase().includes('title slide')) {
                const mainTitle = title.replace(/title\s+slide/gi, '').trim();
                currentSlide = {
                    title: mainTitle || 'Presentation Title',
                    isTitleSlide: true,
                    sections: []
                };
                isTitleSlide = true;
            } else {
                currentSlide = {
                    title: title || `Slide ${slideNumber + 1}`,
                    isTitleSlide: false,
                    sections: [],
                    bulletPoints: []
                };
                isTitleSlide = false;
            }
            
            slideNumber++;
            currentSection = null;
            continue;
        }
        
        // Check for section headers (### Title or **Title**)
        if (line.startsWith('### ') || (line.startsWith('**') && line.endsWith('**') && line.length < 100)) {
            if (currentSlide) {
                // Save previous section
                if (currentSection && (currentSection.bulletPoints.length > 0 || currentSection.paragraph)) {
                    if (!currentSlide.sections) currentSlide.sections = [];
                    currentSlide.sections.push(currentSection);
                }
                
                // Start new section
                let sectionTitle = line.replace(/^###\s+/, '').replace(/\*\*/g, '').trim();
                currentSection = {
                    title: sectionTitle,
                    bulletPoints: [],
                    paragraph: null
                };
            }
            continue;
        }
        
        // Check for bullet points (starting with -, *, or numbers)
        // Also check for indented bullets to determine nesting level
        const bulletMatch = originalLine.match(/^(\s*)([-*]|\d+\.)\s+(.+)/);
        if (bulletMatch && currentSlide) {
            if (!currentSection) {
                currentSection = { bulletPoints: [], paragraph: null };
            }
            
            const indentSpaces = bulletMatch[1].length;
            const indentLevel = Math.floor(indentSpaces / 2); // Each 2 spaces = 1 indent level
            let bulletText = bulletMatch[3].trim();
            
            // Clean the text
            bulletText = cleanText(bulletText);
            
            // Skip only if it's clearly a label or placeholder
            const lowerBullet = bulletText.toLowerCase();
            const shouldSkip = isLabel(bulletText) ||
                              lowerBullet.includes('[title]') ||
                              lowerBullet.includes('[main title]') ||
                              (lowerBullet.includes('key point') && lowerBullet.length < 20) ||
                              (lowerBullet.includes('add 3-5') && lowerBullet.length < 20);
            
            // Be more lenient - include more content
            if (bulletText && !shouldSkip && bulletText.length > 1) {
                // Store bullet with indent level
                currentSection.bulletPoints.push({
                    text: bulletText,
                    indentLevel: indentLevel
                });
            }
            continue;
        }
        
        // Regular paragraph text (not a header, not a bullet)
        // Capture any meaningful content that's not a label
        const lowerLine = line.toLowerCase();
        const isLabelText = isLabel(line);
        
        if (currentSlide && 
            !line.startsWith('#') && 
            !line.startsWith('##') &&
            !line.startsWith('###') &&
            !line.startsWith('- ') &&
            !line.startsWith('* ') &&
            !line.match(/^\d+\.\s/) &&
            line.length > 2 &&
            !isLabelText &&
            !lowerLine.includes('guidelines') &&
            !lowerLine.includes('important guidelines') &&
            !lowerLine.match(/^generate\s+exactly/i) &&
            !lowerLine.match(/^depth\s+level:/i) &&
            !lowerLine.match(/^language:/i) &&
            !lowerLine.match(/^teaching\s+level:/i)) {
            
            if (!currentSection) {
                currentSection = { bulletPoints: [], paragraph: null };
            }
            
            // Clean the text
            let cleanedText = cleanText(line);
            
            // If it's meaningful content, add it
            if (cleanedText && cleanedText.length > 2) {
                // If we have bullets, add as additional bullet point
                // If no bullets, treat as paragraph
                if (currentSection.bulletPoints.length > 0) {
                    // Add as a bullet point if it seems like content
                    if (!cleanedText.toLowerCase().includes('slide') && 
                        !cleanedText.toLowerCase().includes('bullet')) {
                        currentSection.bulletPoints.push({
                            text: cleanedText,
                            indentLevel: 0
                        });
                    }
                } else {
                    // Treat as paragraph
                    if (currentSection.paragraph) {
                        currentSection.paragraph += ' ' + cleanedText;
                    } else {
                        currentSection.paragraph = cleanedText;
                    }
                }
            }
        }
        
        // Handle subtitle in title slide
        if (isTitleSlide && currentSlide && (line.toLowerCase().includes('subtitle') || line.toLowerCase().includes('presenter'))) {
            let subtitle = line.replace(/.*?:\s*/i, '').replace(/\[.*?\]/g, '').trim();
            if (subtitle && subtitle.length > 0) {
                currentSlide.subtitle = subtitle;
            }
        }
    }
    
    // Add the last slide
    if (currentSlide) {
        if (currentSection && (currentSection.bulletPoints.length > 0 || currentSection.paragraph)) {
            if (!currentSlide.sections) currentSlide.sections = [];
            currentSlide.sections.push(currentSection);
        }
        slides.push(currentSlide);
    }
    
    // Post-process: Clean up any remaining label text in slides and ensure all content is captured
    slides.forEach((slide, slideIdx) => {
        // Clean slide title
        if (slide.title) {
            slide.title = slide.title
                .replace(/slide\s+title:?\s*/gi, '')
                .replace(/^title:?\s*/i, '')
                .replace(/^presentation\s+title:?\s*/i, '')
                .trim();
            
            // If title is empty after cleaning, use a default
            if (!slide.title || slide.title.length === 0) {
                slide.title = slide.isTitleSlide ? 'Presentation Title' : `Slide ${slideIdx + 1}`;
            }
        }
        
        // Ensure slide has at least one section
        if (!slide.sections || slide.sections.length === 0) {
            slide.sections = [{ bulletPoints: [], paragraph: null }];
        }
        
        // Clean sections and ensure content is captured
        if (slide.sections) {
            slide.sections.forEach(section => {
                // Clean section title
                if (section.title) {
                    section.title = section.title
                        .replace(/slide\s+title:?\s*/gi, '')
                        .replace(/bullet\s+points?:?\s*/gi, '')
                        .trim();
                }
                
                // Clean bullet points - be less aggressive, only remove obvious labels
                if (section.bulletPoints) {
                    section.bulletPoints = section.bulletPoints.filter(bp => {
                        const text = typeof bp === 'object' ? bp.text : bp;
                        if (!text || text.length < 2) return false;
                        
                        const lower = text.toLowerCase().trim();
                        // Only filter out exact label matches, not partial matches
                        return !(lower === 'slide title:' || 
                                lower === 'bullet points:' ||
                                lower === 'title:' ||
                                lower.match(/^(slide\s+title|bullet\s+points?|title|subtitle|presenter):?\s*$/));
                    });
                }
                
                // Clean paragraph
                if (section.paragraph) {
                    section.paragraph = section.paragraph
                        .replace(/slide\s+title:?\s*/gi, '')
                        .replace(/bullet\s+points?:?\s*/gi, '')
                        .trim();
                }
            });
        }
    });
    
    // Debug: Log what we parsed (remove in production if needed)
    console.log('Parsed slides:', slides.length);
    slides.forEach((slide, idx) => {
        console.log(`Slide ${idx + 1}:`, slide.title, '- Sections:', slide.sections?.length || 0);
        if (slide.sections) {
            slide.sections.forEach((sec, secIdx) => {
                console.log(`  Section ${secIdx + 1}:`, sec.bulletPoints?.length || 0, 'bullets');
            });
        }
    });
    
    // If no slides were parsed, create a default slide
    if (slides.length === 0) {
        slides.push({
            title: 'Presentation',
            isTitleSlide: false,
            sections: [{
                bulletPoints: [
                    { text: 'Content generated successfully', indentLevel: 0 },
                    { text: 'Please review the markdown output above for detailed content', indentLevel: 0 }
                ]
            }]
        });
    }
    
    return slides;
}

// Function to parse markdown content and extract slide information (legacy - kept for compatibility)
function parseMarkdownToSlides(markdownContent) {
    const slides = [];
    const lines = markdownContent.split('\n');
    
    let currentSlide = null;
    let slideNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Check for slide headers (## Slide X: Title or ## Slide Title)
        if (line.startsWith('## Slide')) {
            // Save previous slide if exists
            if (currentSlide && (currentSlide.title || currentSlide.bulletPoints.length > 0)) {
                slides.push(currentSlide);
            }
            
            // Extract title from header
            const titleMatch = line.match(/##\s+Slide\s+\d+:?\s*(.+)/);
            let title = titleMatch ? titleMatch[1] : line.replace(/##\s+Slide\s+\d+:?\s*/, '').trim();
            
            // Clean up title
            title = title.replace(/^Slide\s+\d+:?\s*/i, '').trim();
            
            // Skip placeholder titles
            if (title && !title.includes('[') && title.length > 0) {
                currentSlide = {
                    title: title,
                    bulletPoints: []
                };
                slideNumber++;
            } else {
                currentSlide = {
                    title: `Slide ${slideNumber + 1}`,
                    bulletPoints: []
                };
                slideNumber++;
            }
        }
        // Check for main title (# Presentation Title)
        else if (line.startsWith('# ') && !currentSlide) {
            let title = line.replace('# ', '').replace(/Presentation\s+Title:?\s*/i, '').trim();
            // Remove brackets and placeholder text
            title = title.replace(/\[.*?\]/g, '').trim();
            if (title && title.length > 0) {
                currentSlide = {
                    title: title,
                    bulletPoints: []
                };
                slideNumber++;
            }
        }
        // Check for bullet points (starting with -, *, or numbers)
        else if ((line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) && currentSlide) {
            // Remove bullet markers and clean text
            let bulletText = line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
            
            // Remove markdown formatting
            bulletText = bulletText.replace(/\*\*(.+?)\*\*/g, '$1');
            bulletText = bulletText.replace(/\*(.+?)\*/g, '$1');
            bulletText = bulletText.replace(/`(.+?)`/g, '$1');
            
            // Skip placeholder text and empty bullets
            if (bulletText && 
                !bulletText.includes('[') && 
                !bulletText.toLowerCase().includes('key point') &&
                !bulletText.toLowerCase().includes('add 3-5') &&
                bulletText.length > 2) {
                currentSlide.bulletPoints.push(bulletText);
            }
        }
        // Check for sub-bullets (indented with 2+ spaces)
        else if ((/^\s{2,}[-*]\s/.test(line) || /^\s{2,}\d+\.\s/.test(line)) && currentSlide) {
            let bulletText = line.replace(/^\s+[-*]\s+/, '').replace(/^\s+\d+\.\s+/, '');
            bulletText = bulletText.replace(/\*\*(.+?)\*\*/g, '$1');
            bulletText = bulletText.replace(/\*(.+?)\*/g, '$1');
            bulletText = bulletText.replace(/`(.+?)`/g, '$1');
            
            if (bulletText && !bulletText.includes('[') && bulletText.length > 2) {
                // Append to last bullet point as sub-item or add as new point
                if (currentSlide.bulletPoints.length > 0) {
                    const lastIndex = currentSlide.bulletPoints.length - 1;
                    currentSlide.bulletPoints[lastIndex] += ' • ' + bulletText;
                } else {
                    currentSlide.bulletPoints.push(bulletText);
                }
            }
        }
        // Check for text that might be slide content (not headers, not bullets)
        else if (currentSlide && 
                 !line.startsWith('#') && 
                 !line.startsWith('**') && 
                 line.length > 10 &&
                 !line.includes('Guidelines') &&
                 !line.includes('Important')) {
            // This might be additional content for the current slide
            let cleanText = line.replace(/\*\*(.+?)\*\*/g, '$1');
            cleanText = cleanText.replace(/\*(.+?)\*/g, '$1');
            cleanText = cleanText.replace(/`(.+?)`/g, '$1');
            
            if (cleanText && !cleanText.includes('[') && cleanText.length > 5) {
                // Add as a bullet point if we don't have many yet
                if (currentSlide.bulletPoints.length < 8) {
                    currentSlide.bulletPoints.push(cleanText);
                }
            }
        }
    }
    
    // Add the last slide
    if (currentSlide && (currentSlide.title || currentSlide.bulletPoints.length > 0)) {
        slides.push(currentSlide);
    }
    
    // If no slides were parsed, create a default slide
    if (slides.length === 0) {
        slides.push({
            title: topic,
            bulletPoints: ['Content generated successfully', 'Please review the markdown output above for detailed content']
        });
    }
    
    return slides;
}




// The generateAIResponse function remains the same, as it will now handle AI detection as well.



async function generateResources() {
    const input = document.getElementById('resources-input').value.trim();
    const output = document.getElementById('resources-output');

    const maxResults = 3;

    if (!input) {
        output.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> Please enter a topic first</div>';
        return;
    }
    
    output.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching for resources...</div>';

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(input + " chinese learning")}&maxResults=${maxResults}&key=${apiKey}`);
        const data = await response.json();

        output.innerHTML = '';
        
        if (data.items && data.items.length > 0) {
            const resourceGrid = document.createElement('div');
            resourceGrid.classList.add('resource-grid');

            data.items.forEach(item => {
                const videoElement = document.createElement('div');
                videoElement.classList.add('resource-card');
                videoElement.innerHTML = `
                    <a href="https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank" class="video-link">
                        <div class="video-thumbnail">
                            <img src="${item.snippet.thumbnails.medium.url}" alt="${item.snippet.title}">
                            <div class="play-button"><i class="fas fa-play"></i></div>
                        </div>
                        <h4 class="video-title">${item.snippet.title}</h4>
                        <p class="video-channel">${item.snippet.channelTitle}</p>
                    </a>
                `;
                resourceGrid.appendChild(videoElement);
            });

            output.appendChild(resourceGrid);
        } else {
            output.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> No videos found</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        output.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Error loading resources</div>';
    }
}
// New function to fetch Wikipedia resources using the free MediaWiki API
async function generateWikiResources() {
    const input = document.getElementById('resources-input').value.trim();
    const wikiOutput = document.getElementById('wiki-resources');
  
    if (!input) {
      wikiOutput.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> Please enter a topic first</div>';
      return;
    }
  
    wikiOutput.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching Wikipedia resources...</div>';
  
    try {
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(input)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      wikiOutput.innerHTML = '';
  
      if (data.query && data.query.search && data.query.search.length > 0) {
        const resourceGrid = document.createElement('div');
        resourceGrid.classList.add('resource-grid');
  
        data.query.search.forEach(item => {
          // Create an anchor element that wraps the entire card
          const link = document.createElement('a');
          link.href = `https://en.wikipedia.org/?curid=${item.pageid}`;
          link.target = "_blank";
          link.classList.add("wiki-card");
  
          link.innerHTML = `
            <h4 class="wiki-title">${item.title}</h4>
            <p class="wiki-snippet">${item.snippet.replace(/<\/?[^>]+(>|$)/g, "")}...</p>
          `;
  
          resourceGrid.appendChild(link);
        });
  
        wikiOutput.appendChild(resourceGrid);
      } else {
        wikiOutput.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> No Wikipedia resources found</div>';
      }
    } catch (error) {
      console.error('Error fetching Wikipedia resources:', error);
      wikiOutput.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Error loading Wikipedia resources</div>';
    }
  }
  
  
  // New function to search both YouTube and Wikipedia resources simultaneously
  function generateAllResources() {
    generateResources();
    generateWikiResources();
  }
// This new function is for handling AI Detection and displaying the circular progress
// New AI Detection function to handle circular progress with animation

async function generateAIDetection() {
    const input = document.getElementById('ai-detection-input').value.trim();
    if (!input) return showError('ai-detection-output', 'Please enter a paragraph');
    
    // Revised prompt instructs the API to return only a single numeric value, but
    // if additional text is included, our extraction will pick the last number found.
    await generateAIResponseForAIDetection({
        input: input,
        outputElement: 'ai-detection-output',
        promptTemplate: PROMPT_TEMPLATES.aiDetection(input),  // AI detection prompt
        loadingText: 'Detecting AI-generated content...'
    });
}

// New AI Detection function that processes the API response robustly and updates the UI
async function generateAIResponseForAIDetection({ input, outputElement, promptTemplate, loadingText }) {
    const output = document.getElementById(outputElement);
    output.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> ${loadingText}
        </div>
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "Intelligent Lesson Preparation Assistant"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [{
                    "role": "user",
                    "content": promptTemplate
                }]
            })
        });

        const data = await response.json();
        console.log("Full API response:", data);
        
        const result = data.choices[0].message.content;
        console.log("Extracted API result:", result);

        // Improved extraction: Use regex to find all numbers and choose the last occurrence.
        const extractPercentage = (text) => {
            const matches = [...text.matchAll(/(\d+(\.\d+)?)/g)];
            return matches.length ? parseFloat(matches[matches.length - 1][0]) : NaN;
        };

        const percentage = extractPercentage(result);

        if (isNaN(percentage)) {
            output.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i> Error: Unable to extract a numeric value from the API response.
                </div>
            `;
            return;
        }

        // Clamp the percentage between 0 and 100
        const clampedPercentage = Math.max(0, Math.min(percentage, 100));
        const angle = (clampedPercentage / 100) * 360;
        const circleColor = clampedPercentage < 50 ? 'green' : 'red';
        const dynamicColor = clampedPercentage < 50 ? 'green' : 'red';

        output.innerHTML = `
            <div class="circular-progress-container">
                <div class="circular-progress ${circleColor}" style="background: conic-gradient(${dynamicColor} 0deg, ${dynamicColor} 0deg);">
                    <div class="percentage">${clampedPercentage}%</div>
                </div>
                <div class="circular-progress-message ${circleColor}">
                    This essay is ${clampedPercentage}% generated by AI
                </div>
            </div>
        `;

        // Animate the progress from 0° to the calculated angle
        const progressCircle = document.querySelector('.circular-progress');
        let currentAngle = 0;
        const interval = setInterval(() => {
            if (currentAngle >= angle) {
                clearInterval(interval);
            } else {
                currentAngle++;
                progressCircle.style.background = `conic-gradient(${dynamicColor} 0deg, ${dynamicColor} ${currentAngle}deg, #e6e6e6 ${currentAngle}deg)`;
                progressCircle.querySelector('.percentage').textContent = `${Math.round((currentAngle / 360) * 100)}%`;
            }
        }, 10);
        
    } catch (error) {
        output.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> Error: ${error.message}
            </div>
        `;
        console.error("Error during API call:", error);
    }
}





async function generateStudentAnalysis() {
    const fileInput = document.getElementById('excel-upload');
    let inputText = '';
  
    // Check if a file is uploaded
    if (fileInput.files.length > 0) {
      try {
        // Convert the file to text (CSV)
        inputText = await readExcelFile(fileInput.files[0]);
      } catch (error) {
        return showError('analysis-output', 'Error reading Excel file: ' + error.message);
      }
    } else {
      return showError('analysis-output', 'Please upload an Excel file.');
    }
    
    // Ensure there is some content extracted from the file
    if (!inputText) {
      return showError('analysis-output', 'Uploaded file is empty.');
    }
    
    // Pass the text to your AI analysis
    await generateAIResponse({
      input: inputText,
      outputElement: 'analysis-output',
      promptTemplate: PROMPT_TEMPLATES.analysis(inputText),
      loadingText: 'Analyzing student performance...'
    });
  }
  


// read the Excel file and convert it to CSV format
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          // Read the file as a binary string
          const data = event.target.result;
          // Parse the workbook using SheetJS
          const workbook = XLSX.read(data, { type: 'binary' });
          // Get the first sheet name
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convert the sheet to CSV text (or JSON if preferred)
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          resolve(csvText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  }
  
   
  function handleFileChange(event) {
    const fileNameSpan = document.getElementById('file-name');
    const fileInput = event.target;
    
    if (fileInput.files && fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name;
    } else {
      fileNameSpan.textContent = 'No file chosen';
    }
  }
  
  
  

async function generateAIResponse({input, outputElement, promptTemplate, loadingText}) {
    const output = document.getElementById(outputElement);
    output.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> ${loadingText}
        </div>
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "Intelligent Lesson Preparation Assistant"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [{
                    "role": "user",
                    "content": promptTemplate
                }]
            })
        });
        
        const data = await response.json();
        const result = data.choices[0].message.content;
        
        output.innerHTML = marked.parse(result);
        addCopyButton(outputElement);
        
    } catch (error) {
        output.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> Error: ${error.message}
            </div>
        `;
    }
}

function addCopyButton(elementId) {
    const output = document.getElementById(elementId);
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(output.innerText);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
        }, 2000);
    };
    output.prepend(copyBtn);
}

function showError(elementId, message) {
    const output = document.getElementById(elementId);
    output.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i> ${message}
        </div>
    `;
}