# Project Details
## Summary (Elevator Pitch)
Turn class notes into productive study sessions. Students upload their notes and/or topic lists, and the agent guides them through a study session with practice quizzes, flashcards, and evaluations of progress. The study materials and methods adapt based on user performance, emphasizing weak areas and continually quizzing until the agent has determined that a sufficient level of mastery has been reached.

The user can review AI actions (like flashcard generation or grading decisions) and control when to move forward in their study flow.

## Contributors
Audrey Inglish (Solo)

## Rough List of Features
- User uploads study materials (ideally, this would take multiple formats -- pdf, plain text, markdown).
- AI parses notes and gathers a list of key concepts. These concepts are saved to the course dashboard.
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



---
---
## Project Schedule

### 1 - Oct 29: Basic Project Structure & Deployment
Deploy a basic typescript "Hello World" app to Kubernetes. Tests and linting should automatically run in the pipeline.

#### Estimates:

Rubric items:
- Technology: CI/CD pipeline
- Technology: tests run in pipeline, pipeline aborts if they fail
- Technology: Developer type helping (typescript)

Features:
- Basic "Hello, World!" application deployed to kubernetes, with secure connection

To-Dos & Subrequirements:
- [X] basic project setup (client and server projects with proper config files)
- [X] set up eslint
- [X] basic unit test (assert pass/fail) to test pipeline
- [X] linter runs in pipeline
- [X] unit tests run in pipeline
- [X] create Dockerfiles for client and server
- [X] set up development docker-compose with basic postgres database
- [X] create Kubernetes namespace and yaml files for deployments & services, ingress, and pvc
- [X] ssl - retrieve and save cert as kube secret for secure connection

#### Delivered

Rubric Items:
- Technology: CI/CD pipeline
- Technology: tests run in pipeline, pipeline aborts if they fail
- Technology: Developer type helping (typescript)

Features:
- Basic "Hello, World!" application deployed to kubernetes, with secure connection

---

### 2 - Nov 1: Authentication & Keycloak Configuration
Implement full auth flow using OIDC and Keycloak.

#### Estimates:

Rubric items:
- Technology: authentication and user account support
- Technology: authorized pages and public pages

Features:
- [X] User login
- [X] Authorized/protected endpoints
- [X] Basic styling

To-Dos & Subrequirements:
- [X] create a keycloak client and user
- [X] set up react-oidc-context
- [X] use jwtVerify on the server side and route all api endpoints through auth middleware
- [X] create a basic homepage (not sure navbar is necessary yet)
- [X] implement auth flow (~~register,~~ login, logout) -- Q: Will we need "register"?
- [X] create basic routing (public vs. authorized endpoints)
- [X] set up Tailwind
- [X] work on mockups for basic UI and dashboard (?)
  - [X] pick fonts and color scheme

#### Delivered

Rubric Items:
- Technology: authentication and user account support
- Technology: authorized pages and public pages

Features:
- [X] User login
- [X] Authorized/protected endpoints
- [X] Basic styling

---
### 3 - Nov 5: Storage and State Management

#### Estimates:

Rubric items:
- Technology: use local storage
- Technology: Client side state stores (e.g. tanstack query or context)
- Technology: Toasts / global notifications or alerts
- Technology: Error handling (both on api requests and render errors)

Features:
- [X] Persistent dashboards/courses per user
- [X] basic notes upload (plain text)
- [X] Smooth UI feedback for saving, errors, and loading
- [X] Global notifications for success/error messages

To-Dos & Subrequirements:
- [X] create database schema for dashboards, notes, flashcards, quizzes, and user performance, accounting for multiple users
- [X] implement zod validation schemas on client and server
- [X] basic REST API endpoints (CRUD for dashboards and notes)
- [X] use TanStack Query for client-side state
- [X] have a basic apiFetch helper (custom or axios)
- [X] add localStorage caching for last-used dashboard (and session mode?)
- [X] global error boundary & API error handling
- [X] toast notifications for save success/failure (react-hot-toast)
- [X] test create/edit/delete dashboard flow

#### Delivered

Rubric Items:
- Technology: use local storage
- Technology: Client side state stores (e.g. tanstack query or context)
- Technology: Toasts / global notifications or alerts
- Technology: Error handling (both on api requests and render errors)

Features:
- [X] Persistent dashboards/courses per user
- [X] basic notes upload (plain text)
- [X] Smooth UI feedback for saving, errors, and loading
- [X] Global notifications for success/error messages

---
### 4 - Nov 8: Basic AI Integration
#### Estimates:

Rubric items:
- Technology: Network Calls that read and write data

Features:
- [X] AI integration - user can get a list of concepts from uploaded notes
- [X] spinners to indicate loading state

To-Dos & Subrequirements:
- [X] connect to OpenAI completions endpoint
- [X] create /api/parseNotes route: send text, receive JSON concept list
- [X] display a generated list of concepts on the dashboard
- [X] add loading spinners & error toasts for request states
- [X] cache concept lists with TanStack Query
- [X] verify server error handling on failed responses
- [X] feedback for failed parsing of notes

#### Delivered

Rubric Items:
- Technology: Network Calls that read and write data


Features:
- [X] AI integration - user can get a list of concepts from uploaded notes
- [X] spinners to indicate loading state
  
---
### 5 - Nov 12: Flashcard Mode
#### Estimates:

Rubric items:
- Project scope expansion
- 3+ generic form input components
- 2+ generic layout components
- Network calls & error handling

Features:
- [X] AI generates flashcards from parsed notes
- [X] Interactive flashcard study mode (UI)

To-Dos & Subrequirements:
- [X] Generate flashcards
- [X] ensure forms use generic form input components
- [X] Create Flashcard component (front/back flip)
- [X] implement generic layout components for flashcard carousel and CardList
- [X] Save flashcards per dashboard to DB
- [X] Add progress tracker and “mark for review” option
- [X] Create form inputs: TextInput, SelectInput, TextArea, ToggleInput

#### Delivered

Rubric Items:
- Project scope expansion
- 3+ generic form input components
- 2+ generic layout components
- Network calls & error handling

Features:
- [X] AI generates flashcards from parsed notes
- [X] Interactive flashcard study mode (UI)
---
### 6 - Nov 15: Quiz Mode
#### Estimates:

Rubric items:
- Network calls & error handling
- Project scope (LLM evaluation logic)

Features:
- [X] AI creates quizzes and grades answers
- [X] Results summarized per topic
- [ ] upload notes as pngs and pdfs

To-Dos & Subrequirements:
- [X] basic form for quiz config -- choose question types & number of questions, then click "generate"
- [X] implement evaluateResponse() grading API
- [X] build Quiz component (multiple-choice + short answer)
- [X] Create “Quiz Results” page (scores, feedback, and explanations from AI)
- [X] store quiz results in DB

#### Delivered

Rubric Items:
- Network calls & error handling
- Project scope (LLM evaluation logic)
  
Features:
- [X] AI creates quizzes and grades answers
- [X] Results summarized per topic
---
### 7 - Nov 19: Adaptive Study & Agentic Loop
#### Estimates:

Rubric items:
- Project scope expansion
- Professional, organized experience
- Technology: 4+ generic layout components


Features:
- [ ] Live adaptive study session (AI-driven switching between quiz/flashcard)
- [ ] Preparedness score with progress visualization

To-Dos & Subrequirements:
- [ ] Implement startStudySession() loop (autonomous switching logic)
- [ ] Implement navigateToMode() to adjust UI dynamically

#### Delivered

Rubric Items:


Features:

---
### 8 - Nov 22: Progress Visualization & AI Action History
#### Estimates:

Rubric items:
- Technology: 10+ pages or views


Features:
- Preparedness score with progress visualization
- User can see a log of AI reasoning & actions

To-Dos & Subrequirements:
- [ ] Build visual progress tracker (chart, bar, or ring progress indicator)
- [ ] Log all AI actions to history for transparency (AI Action History page)
- [ ] Add time-tracking and “take a break” notifications (?)
- [ ] Test full end-to-end study session loop

#### Delivered

Rubric Items:


Features:

---
### 9 - Nov 25: Mobile Responsiveness & UX Polish
#### Estimates:

Rubric items:
- Experience: All experiences mobile friendly
- Experience: 3 instances where elements reorder on smaller screens
- Professional, organized, smooth experience

Features:
- Fully responsive layouts
- Reordering behavior verified on 3 key pages (Dashboard, Flashcards, Quiz)
  
To-Dos & Subrequirements:
- [ ] Add responsive breakpoints using Tailwind
- [ ] Reorder card and column layouts for smaller screens
- [ ] Optimize Flashcard and Quiz components for touch devices
- [ ] Adjust spacing, typography, and scaling for mobile
- [ ] Adjust colors/theming as necessary

#### Delivered

Rubric Items:


Features:

---
### 10 - Dec 3: Testing & UI Adjustments
#### Estimates:

Rubric items:
- Technology: Tests run in pipeline, pipeline aborts if they fail
- Technology: Linting in pipeline
- Technology: Error handling (both on api requests and render errors)
- Professional, organized and smooth experience

Features:
- Verified smooth user flow (loading states, error handling for API and UI)

To-Dos & Subrequirements:
- [ ] run through full user flow on desktop, adjust UI as needed
- [ ] responsive checks - run through full user flow on mobile, adjusting as needed
- [ ] hunt for bugs


#### Delivered

Rubric Items:


Features:

---
### Dec 6 - FINAL DEADLINE
#### Estimates:

Rubric items:
- Professional, organized, and smooth experience
- Project scope validated

Features:
- [ ] demo-ready version
- [ ] polished UI/UX

To-Dos & Subrequirements:
- [ ] prep presentation
- [ ] verify each rubric requirement is met
- [ ] final submission

#### Delivered

Rubric Items:


Features:



