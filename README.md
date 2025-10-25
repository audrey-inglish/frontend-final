# Project Details
## Summary (Elevator Pitch)
Turn class notes into productive study sessions. Students upload their notes and/or topic lists, and the agent guides them through a study session with practice quizzes, flashcards, and evaluations of progress. The study materials and methods adapt based on user performance, emphasizing weak areas and continually quizzing until the agent has determined that a sufficient level of mastery has been reached.

The user can review AI actions (like flashcard generation or grading decisions) and control when to move forward in their study flow.

## Contributors
Audrey Inglish (Solo)

## Rough List of Features
- User uploads study materials (ideally, this would take multiple formats -- pdf, plain text, markdown).
- AI parses notes and gathers a list of key concepts.
- **Flashcard Mode:** AI generates a series of flashcards with questions/terms on the front and answers/definitions on the back. In the UI, the user can cycle through these, marking the ones they need more practice on.
- **Quiz Mode:** AI generates a practice quiz for the user to work through. User can specify number of questions and question type. This practice quiz could be a form that the user can submit for instant feedback from the AI.
- **Live Adaptive Study Mode:** Agent continually quizzes user, moving on to new topics when it decides sufficient mastery is reached on the current topic. When all topics are sufficiently studied, the AI returns a preparedness score. 
- User can create new dashboards to keep courses/exams separate. These dashboards would store flashcards, practice quizzes, and progress reports for the given course. Users can save flashcard sets and quizzes that they would like to revisit.
- Agent chat view showing reasoning steps and actions taken.
- Potential feature: Time-based adaptive study sessions. While quizzing the user, the AI tracks the time spent working, suggesting breaks and updating the user on the time spent working.
- User accounts

### Four Custom Functions
1. **Generate study materials (Autonomous):** Reads user-uploaded notes and creates flashcards + quiz questions.
2. **Start study session (Autonomous):** Runs a study loop (quiz or flashcard mode), automatically continuing until all topics are covered.
3. **Evaluate response (Require Confirmation):** Grades user answers and updates topic performance. User confirms each next step after seeing feedback.
4. **Navigate_to_mode (Adjust UI):** Adjusts the UI automatically to move between study modes.


### Additional Tasks
Streaming generation in the UI.
Benchmarking tool (user sets thresholds for mastery levels, speed goals, and other options).
Working with pictures/pdfs.

## Project Risks
- File upload and parsing
- Streaming LLM responses
- Adaptive quiz logic


## Pages/Views
1. Home (lists dashboards)
2. Create new dashboard
3. Course dashboard (flashcard sets, saved quizzes, progress reports)
4. Upload notes
5. Flashcard study
6. Fully generated quiz view
7. Quiz results view
8. Live study session view
9. Preparedness report
10. AI Action History / Logs






