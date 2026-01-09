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