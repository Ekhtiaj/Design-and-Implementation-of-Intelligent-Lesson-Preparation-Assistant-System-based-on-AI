const PROMPT_TEMPLATES = {
   lessonPlan: (topic) => `
Please act as a Chinese language teaching expert and generate a complete lesson plan with the theme "${topic}".  
The output should be clean plain text, without heavy use of Markdown symbols, but must include all of the following:

【Basic Information】
- Course Name:
- Course Code:
- Credits:
- Offering College:
- Class Hours:
- Course Category:
- Course Nature:

【I. Nature of the Course】
Explain in detail the positioning, background, and significance of offering this course.

【II. Course Objectives】
Clearly list the teaching objectives of this course, divided into the following aspects:  
(1) Ideological and quality education objectives  
(2) Knowledge teaching objectives  
(3) Ability training objectives  

【III. Course Content and Basic Requirements】
According to knowledge units or chapters, describe in detail the teaching content and requirements of each part, and specify the class hours allocated for each section.

【IV. Experimental/Practical Components and Basic Requirements】
If there are experimental or practical components, explain them in detail; if not, indicate: "This course has no experimental or practical components."

【V. Matrix of Course Content and Course Objectives】
Provide a matrix showing the correspondence between course content and teaching objectives.

【VI. Requirements for Student Competency Development】
Explain how this course develops students' overall abilities, especially in cultural literacy, logical thinking, and global vision.

【VII. Course Hour Allocation】
List in detail the hour allocation of each teaching unit or chapter, and attach a course hour allocation table.

【VIII. Suggested Textbooks and References】
List textbooks and major references, including author, publisher, and publication year.

【IX. Course Assessment】
Explain the assessment methods, grading components, and evaluation standards of this course.

Ensure the output is comprehensive, well-structured, and avoids excessive formatting symbols—use only necessary markers for direct reading and practical use.
`,

   exercises: (topic) => `
Please act as an expert well-versed in Chinese culture, and design a set of exercises on the theme "${topic}" that can inspire students to explore and reflect deeply on Chinese culture.  
Ensure the output emphasizes cultural understanding and experience, and can be directly adopted or used as inspiration by teachers.  
Organize the content into the following sections and output using Markdown format:

1. **Discussion Questions**  
   - Propose open-ended discussion questions that encourage students to explore the historical significance, social impact, and modern value of "${topic}" in Chinese culture.  
   - Example: Discuss the role of this theme in traditional customs, artistic expression, or social development.  

2. **Research Task**  
   - Design a research assignment requiring students to consult related materials and analyze the cultural meaning and developmental context behind "${topic}".  
   - The task description should include research purpose, steps, and expected outcomes.  

3. **Creative Project**  
   - Propose a creative project, such as making a poster, short video, cultural display board, or digital story, to let students express their understanding of Chinese culture centered on "${topic}".  
   - List key creation points and evaluation criteria.  

4. **Case Study**  
   - Select a specific case or historical event related to "${topic}" for students to analyze in depth, discussing its cultural significance and implications for modern society.  
   - Require students to write an analysis report and present their insights.  

5. **Interactive Activity**  
   - Design a classroom activity (e.g., group discussion, role-play, or scenario simulation) using "${topic}" as the background to encourage student interaction and cooperation.  
   - The activity plan should include objectives, process, and expected discussion outcomes.  

Ensure the overall structure is clear and logical so teachers can directly reference or gain inspiration for organizing classroom exercises.
`,

   analysis: (input) =>  `
Analyze the following student data:

   "${input}"

The data may include student grade information (e.g., student names and scores for each assignment) or attendance records. Perform the following analysis:

1. For grade data:  
   - Calculate the average score for each assignment.  
   - Identify assignments with an average score significantly lower than others (e.g., if Assignment 2 has a much lower average, suggest reviewing its content).  
   - Highlight any trends, strengths, or areas for improvement.  

2. For attendance records:  
   - Identify students with irregular attendance, such as those absent for three or more consecutive times.  
   - Provide suggestions for addressing these attendance issues.  

Write your analysis clearly in Markdown format and include sections such as “Observations” and “Recommendations.”
`,

   // New prompt for AI Detection
   aiDetection: (input) =>  `
Analyze the following text for characteristics typical of AI-generated content. Consider factors such as repetitive phrasing, overly consistent sentence structure, lack of personal nuance, and unnatural transitions. Then, assign a likelihood score from 0 to 100—where 0 means it is almost certainly human-written and 100 means it is almost certainly AI-generated. Only output the numeric score.
Text: "${input}"`,

   // PPT Generator prompt
   pptGenerator: (topic, numSlides, depthLevel, language, teachingLevel) => `
Please act as an expert in creating educational PowerPoint presentations and generate a complete PowerPoint presentation outline with slides content according to the following specifications:

**Topic**: "${topic}"
**Number of Slides**: ${numSlides} slides
**Depth Level**: ${depthLevel}
**Language**: ${language}
**Teaching Level**: ${teachingLevel}

The output should be organized in Markdown format and must include the following:

# Presentation Title: [Title]

## Slide 1: Title Slide
- Title: [Main title]
- Subtitle: [Subtitle if applicable]
- Presenter: [Name/Institution]

## Slide 2: Overview/Introduction
- Brief introduction to the topic
- Objectives of the presentation
- What the audience will learn

## Slide 3 to Slide ${numSlides - 1}: Main Content Slides
For each slide, provide:
- **Slide Title**: [Clear and concise title]
- **Bullet Points**: 
  - Key point 1
  - Key point 2
  - Key point 3
  - (Add 3-5 bullet points per slide)

## Slide ${numSlides}: Summary/Key Takeaways or Thank You / Q&A
- Main points recap (if summary slide)
- Closing statement
- Q&A section (if applicable)

**Important Guidelines:**
1. Generate exactly ${numSlides} slides total
2. Depth Level: ${depthLevel === 'basic' ? 'Use simple language and basic concepts suitable for beginners' : depthLevel === 'standard' ? 'Use moderate detail with clear explanations' : 'Provide comprehensive and detailed content with in-depth analysis'}
3. Language: All content must be in ${language === 'Chinese' ? 'Chinese (简体中文)' : 'English'}
4. Teaching Level: Content should be appropriate for ${teachingLevel === 'primary' ? 'primary/elementary school students' : teachingLevel === 'secondary' ? 'secondary/high school students' : 'university/college students'}
5. Ensure the content is well-structured, informative, and follows a logical flow
6. Use Markdown formatting for clear presentation
7. Adapt the complexity of vocabulary and concepts according to the teaching level specified
`
};
