// Simple and reliable PPT content parser
// This parser extracts all content between slide headers

function parseMarkdownToSlidesSimple(markdownContent) {
    const slides = [];
    const lines = markdownContent.split('\n');
    
    let currentSlide = null;
    let currentContent = [];
    
    // Helper to clean text
    const clean = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\[.*?\]/g, '')
            .trim();
    };
    
    // Helper to check if it's a label
    const isLabel = (text) => {
        const lower = text.toLowerCase().trim();
        return lower === 'slide title:' ||
               lower === 'bullet points:' ||
               lower.match(/^(slide\s+title|bullet\s+points?|title|subtitle|presenter):?\s*$/);
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const original = line;
        
        if (!trimmed) continue;
        
        // Check for main title (# Title)
        if (trimmed.startsWith('# ') && !trimmed.startsWith('##')) {
            // Save previous slide
            if (currentSlide && currentContent.length > 0) {
                currentSlide.content = currentContent;
                slides.push(currentSlide);
            }
            
            const title = clean(trimmed.replace(/^#\s+/, '').replace(/Presentation\s+Title:?\s*/i, ''));
            if (title) {
                currentSlide = {
                    title: title,
                    isTitleSlide: true,
                    content: []
                };
                currentContent = [];
            }
            continue;
        }
        
        // Check for slide header (## Slide X: Title)
        if (trimmed.startsWith('## Slide') || trimmed.startsWith('## ')) {
            // Save previous slide
            if (currentSlide && currentContent.length > 0) {
                currentSlide.content = currentContent;
                slides.push(currentSlide);
            }
            
            // Extract title
            let title = trimmed.replace(/^##\s+Slide\s+\d+:?\s*/i, '').replace(/^##\s+/, '').trim();
            title = clean(title);
            
            if (!title || title.length === 0) {
                title = `Slide ${slides.length + 1}`;
            }
            
            currentSlide = {
                title: title,
                isTitleSlide: false,
                content: []
            };
            currentContent = [];
            continue;
        }
        
        // Collect all other content
        if (currentSlide && trimmed.length > 0) {
            // Skip obvious labels
            if (!isLabel(trimmed)) {
                // Check if it's a bullet point
                const bulletMatch = original.match(/^(\s*)([-*]|\d+\.)\s+(.+)/);
                if (bulletMatch) {
                    const indent = Math.floor(bulletMatch[1].length / 2);
                    const text = clean(bulletMatch[3]);
                    if (text && text.length > 1 && !isLabel(text)) {
                        currentContent.push({
                            type: 'bullet',
                            text: text,
                            indentLevel: indent
                        });
                    }
                } else {
                    // Regular text
                    const cleaned = clean(trimmed);
                    if (cleaned && cleaned.length > 2 && !isLabel(cleaned)) {
                        // Check if it looks like a bullet point without marker
                        if (trimmed.match(/^[•·▪▫]\s/)) {
                            currentContent.push({
                                type: 'bullet',
                                text: cleaned.replace(/^[•·▪▫]\s+/, ''),
                                indentLevel: 0
                            });
                        } else {
                            currentContent.push({
                                type: 'text',
                                text: cleaned
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Save last slide
    if (currentSlide) {
        if (currentContent.length > 0) {
            currentSlide.content = currentContent;
        }
        slides.push(currentSlide);
    }
    
    // Convert to format expected by PPTX generator
    return slides.map(slide => {
        const sections = [{
            bulletPoints: [],
            paragraph: null
        }];
        
        slide.content.forEach(item => {
            if (item.type === 'bullet') {
                sections[0].bulletPoints.push({
                    text: item.text,
                    indentLevel: item.indentLevel
                });
            } else if (item.type === 'text') {
                if (sections[0].bulletPoints.length === 0) {
                    if (sections[0].paragraph) {
                        sections[0].paragraph += ' ' + item.text;
                    } else {
                        sections[0].paragraph = item.text;
                    }
                } else {
                    // Add as bullet if we already have bullets
                    sections[0].bulletPoints.push({
                        text: item.text,
                        indentLevel: 0
                    });
                }
            }
        });
        
        return {
            title: slide.title,
            isTitleSlide: slide.isTitleSlide,
            sections: sections
        };
    });
}
