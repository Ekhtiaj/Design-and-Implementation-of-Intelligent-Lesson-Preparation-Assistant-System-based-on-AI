let currentChart = null;  // Variable to store the current chart instance
let studentGradesChart = null; // Variable to store the second chart instance

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

  // Proceed with generating the first chart
  generateCharts();

  // Proceed with generating the second chart
  generateStudentGradesChart();

  // Pass the text to your AI analysis and display the generated paragraph below the chart
  await generateAIResponse({
    input: inputText,
    outputElement: 'ai-response',  // Change the output element to 'ai-response'
    promptTemplate: PROMPT_TEMPLATES.analysis(inputText),
    loadingText: 'Analyzing student performance...'
  });
}

// Function to generate the first chart (Average Scores by Homework)
function generateCharts() {
  const fileInput = document.getElementById('excel-upload');
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload a file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });

    // Assuming we work with the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Identify homework columns; adjust as necessary for your data structure.
    const homeworkColumns = Object.keys(jsonData[0]).filter(key =>
      key.toLowerCase().includes("homework")
    );

    // Calculate average scores for each homework column.
    const avgScores = homeworkColumns.map(col => {
      let total = 0, count = 0;
      jsonData.forEach(row => {
        if (row[col] !== undefined && !isNaN(row[col])) {
          total += parseFloat(row[col]);
          count++;
        }
      });
      return total / (count || 1);
    });

    // Identify the homework assignment with the lowest average score.
    const minAvg = Math.min(...avgScores);

    // Create color arrays: highlight the lowest average score bar with red.
    const backgroundColors = avgScores.map(avg =>
      avg === minAvg ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)'
    );
    const borderColors = avgScores.map(avg =>
      avg === minAvg ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)'
    );

    // Get the canvas context and generate the first chart.
    const ctx = document.getElementById('scoreChart');
    if (ctx) {
      const chartCtx = ctx.getContext('2d');

      // Destroy the old chart if it exists
      if (currentChart) {
        currentChart.destroy();
      }

      // Create a new chart with custom data and colors
      currentChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
          labels: homeworkColumns,
          datasets: [{
            label: 'Average Score',
            data: avgScores,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Average Score'
              }
            }
          }
        }
      });
    } else {
      console.error('Canvas element #scoreChart not found.');
    }
  };

  reader.readAsBinaryString(file);
}

// Function to generate the second chart (Grades by Student)
function generateStudentGradesChart() {
  const fileInput = document.getElementById('excel-upload');
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload a file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });

    // Assuming we work with the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Identify homework columns; adjust as necessary for your data structure.
    const homeworkColumns = Object.keys(jsonData[0]).filter(key =>
      key.toLowerCase().includes("homework")
    );

    // Extract student names (assuming they are stored in the first column of the sheet)
    const studentNames = jsonData.map(row => row["Student Name"] || "Unknown");  // Adjust this if necessary

    // Create an array to store student grades for each homework.
    const studentGrades = jsonData.map(row => {
      return homeworkColumns.map(col => row[col] || 0); // Collect grades for each student per homework
    });

    // Generate a color for each student (distinct colors for each line)
    const colors = studentGrades.map((_, index) => {
      return `hsl(${(index * 360 / studentGrades.length)}, 100%, 50%)`; // Generate a distinct color for each student
    });

    // Get the canvas context and generate the second chart.
    const ctx = document.getElementById('studentGradesChart');
    if (ctx) {
      const chartCtx = ctx.getContext('2d');

      // Destroy the old chart if it exists
      if (studentGradesChart) {
        studentGradesChart.destroy();
      }

      // Create a new line chart for student grades
      studentGradesChart = new Chart(chartCtx, {
        type: 'line',
        data: {
          labels: homeworkColumns,
          datasets: studentGrades.map((grades, index) => ({
            label: studentNames[index],  // Use student names here
            data: grades,
            borderColor: colors[index],
            backgroundColor: 'rgba(0,0,0,0)', // Transparent background
            fill: false,
            borderWidth: 2
          }))
        },
        options: {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Grade'
              }
            }
          }
        }
      });
    } else {
      console.error('Canvas element #studentGradesChart not found.');
    }
  };

  reader.readAsBinaryString(file);
}

// Function to handle the file change event and display the file name
function handleFileChange(event) {
  const fileNameSpan = document.getElementById('file-name');
  const fileInput = event.target;

  // Check if the user has selected a file
  if (fileInput.files && fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
  } else {
    fileNameSpan.textContent = 'No file chosen';
  }
}

// Function to read the Excel file and convert it to CSV format
function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
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
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsBinaryString(file);
  });
}

// Function to display error messages in the output box
function showError(elementId, message) {
  const output = document.getElementById(elementId);
  output.innerHTML = 
    `<div class="error">
      <i class="fas fa-exclamation-circle"></i> ${message}
    </div>`;
}
