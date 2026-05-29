# AGENTS.md Generator Prompt

Use this prompt when starting a new repository to generate a comprehensive, well-structured AGENTS.md file following progressive disclosure principles.

---

## Prompt for AI Agents

Analyze this codebase and create an AGENTS.md file with supporting documentation following progressive disclosure principles.

### Step 1: Analyze the Codebase

Discover what type of project this is and examine relevant aspects:

**For all projects:**
- Package manager and build system
- Project structure and organization
- Available commands/scripts
- Testing approach (if any)
- Key technologies and frameworks

**Conditionally examine (only if present):**
- API endpoints and routes
- Database schema and migrations
- State management patterns
- Build/deployment pipelines
- Configuration management
- Authentication/authorization
- External service integrations

### Step 2: Create Root AGENTS.md

Create a **minimal** root `AGENTS.md` file containing ONLY:

1. **One-sentence project description** - What the project does and its primary purpose

2. **Quick Start** (3-5 most common commands):
   - Install/setup command
   - Primary run/dev command
   - Test command (if tests exist)
   - Build command (if applicable)

3. **Tech Stack** - Brief list of key technologies (language, framework, database, etc.)

4. **Documentation Links** - Links to detailed docs in `docs/` folder (adapt based on project type)

5. **Agent Guidelines** (5-7 critical, project-specific rules):
   - Only include non-obvious, non-standard patterns
   - Focus on "gotchas" and multi-step workflows
   - Examples: migration workflows, multi-file update patterns, special conventions
   - **Omit:** Standard practices, framework defaults, obvious advice

6. **Project Structure** - ASCII tree showing only the most important directories/files (10-15 items max)

7. **Key Interfaces** (adapt to project type):
   - Web apps: API endpoints
   - Libraries: Public API surface
   - CLIs: Command structure
   - Scripts: Entry points
   - Omit if not applicable

**Keep the root file under 150 lines.** Everything else goes in separate docs.

### Step 3: Create Supporting Documentation

Create a `docs/` folder with files **relevant to this project**. Only create files that have substantial content (>20 lines). Adapt file names and content to project type.

#### Core Files (create if applicable):

**`docs/architecture.md`** (for projects with multiple components/layers)
- System design overview
- Component/module relationships
- Data flow
- Design patterns used
- Technology choices and rationale

**`docs/commands.md`** (if project has >5 commands)
- All available commands organized by purpose
- Include: development, build, test, deployment, maintenance
- Omit if commands are self-explanatory or <5 total

**`docs/development-workflow.md`** (for projects with non-standard workflows)
- How to add features
- Code conventions that differ from language/framework defaults
- Multi-step processes (e.g., schema changes, API updates)
- Environment setup
- Omit standard practices

**`docs/testing.md`** (if tests exist)
- Test configuration
- How to run tests
- How to write tests (with examples)
- Test patterns specific to this project
- Omit if testing is standard for the framework

**`docs/troubleshooting.md`** (for projects with known issues)
- Common problems and solutions
- Debugging approaches
- Known limitations
- Omit if no recurring issues

#### Optional Files (create only if relevant):

**`docs/api.md`** (for projects exposing APIs)
- API design patterns
- Authentication/authorization
- Request/response formats
- Versioning strategy

**`docs/database.md`** (for projects with databases)
- Schema design
- Migration workflow
- Query patterns
- Performance considerations

**`docs/deployment.md`** (for deployable projects)
- Deployment process
- Environment configuration
- CI/CD pipeline
- Monitoring and logging

**`docs/integrations.md`** (for projects with external services)
- External service details
- Authentication methods
- Rate limiting
- Fallback strategies

### Step 4: Apply Quality Filters

**EXCLUDE these from all documentation:**

❌ **Redundant/Obvious Instructions:**
- "Read before writing" / "Check existing patterns"
- "Write clean code" / "Follow best practices"
- "Test your changes" (unless specific testing pattern is required)
- "Use proper error handling" (too vague)
- Anything the language/framework enforces automatically

❌ **Information Inferable from Code:**
- Complete dependency lists (link to package.json instead)
- Obvious file purposes ("server.ts is the server")
- Standard framework conventions

❌ **Overly Vague Advice:**
- "Handle errors gracefully"
- "Write maintainable code"
- "Consider performance"

✅ **DO INCLUDE:**
- Non-standard workflows
- Project-specific conventions
- Critical gotchas
- Multi-step processes
- Integration patterns
- Actionable, specific instructions

### Step 5: Verify Structure

Ensure the final structure is appropriate for this project:

```
repository/
├── AGENTS.md                      # Minimal root (under 150 lines)
└── docs/
    ├── [relevant-doc-1].md        # Only files with substantial content
    ├── [relevant-doc-2].md        # Adapted to project type
    └── [relevant-doc-3].md        # 3-6 files typical
```

**Don't create:**
- Empty or near-empty files
- Files with only obvious information
- Files that duplicate README.md content
- More than 8 documentation files (too fragmented)

### Step 6: Output Format

1. Create all files in a single response
2. Use proper markdown formatting
3. Include code blocks with syntax highlighting
4. Use clear section headers
5. Add links between related documentation
6. Keep language concise and actionable

### Example Root AGENTS.md Template

Adapt this template to the project type. Remove sections that don't apply.

```markdown
# AGENTS.md

[One-sentence description of what this project does]

## Quick Start

\`\`\`bash
[command to install/setup]
[command to run/start]
[command to test]
\`\`\`

## Tech Stack

- **[Category]:** [technologies]
- **[Category]:** [technologies]
- **[Category]:** [technologies]

## Documentation

[Only link to docs that exist - remove irrelevant ones]

- **[Doc Name](docs/filename.md)** - Brief description
- **[Doc Name](docs/filename.md)** - Brief description
- **[Doc Name](docs/filename.md)** - Brief description

## Agent Guidelines

When working on this codebase:

1. **[Specific non-obvious rule]:** [Actionable instruction]
2. **[Specific non-obvious rule]:** [Actionable instruction]
3. **[Specific non-obvious rule]:** [Actionable instruction]

[Only include 3-7 rules that are truly project-specific]

## Project Structure

\`\`\`
project/
├── [key-directory]/     # Brief description
│   └── [key-file]       # Brief description
├── [key-directory]/     # Brief description
└── [key-file]           # Brief description
\`\`\`

[Optional section - adapt to project type or remove]
## [Key Interfaces/Commands/API/Entry Points]

[List the main ways to interact with this project]

See [Relevant Doc](docs/filename.md) for details.
```

---

## Project Type Adaptations

Adapt the structure based on what you discover:

**Web Application:**
- Include API endpoints section
- Document frontend/backend split
- Include deployment info

**Library/Package:**
- Focus on public API surface
- Include usage examples
- Document versioning strategy

**CLI Tool:**
- Document command structure
- Include common workflows
- Show example usage

**Script/Automation:**
- Document entry points
- Show configuration options
- Include scheduling info (if applicable)

**Data Pipeline:**
- Document data flow
- Include transformation steps
- Show monitoring approach

**Mobile App:**
- Include platform-specific setup
- Document build variants
- Include signing/deployment info

**Infrastructure/Config:**
- Document resource structure
- Include deployment process
- Show environment differences

## Quality Checklist

Before finalizing, verify:

- [ ] Root AGENTS.md is under 150 lines
- [ ] Only created docs that have substantial, non-obvious content
- [ ] No redundant or obvious instructions (e.g., "write clean code")
- [ ] Agent Guidelines are specific and actionable (not generic advice)
- [ ] Project structure shows only key files (not exhaustive)
- [ ] Commands are accurate for this project's setup
- [ ] No information that duplicates README.md
- [ ] Documentation structure fits the project type
- [ ] All links work correctly
- [ ] Code examples use correct syntax for this project's language

---

## Usage

**To generate AGENTS.md for a new repository:**

1. Copy everything from "Prompt for AI Agents" to the end of Step 6
2. Paste into your AI agent chat
3. The agent will analyze the codebase and generate appropriate documentation

**The agent will:**
- Detect project type automatically
- Create only relevant documentation files
- Adapt structure to the specific project
- Exclude obvious or redundant information
- Follow progressive disclosure principles
