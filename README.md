View the website : https://ai.studio/apps/drive/1J6BbBTUtrFhqiHbeHBNrb9sOknTAJSuI
---
## Run Locally
Prerequisites: Node.js
1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

   # Requirements Document

## Introduction

The AI Vehicle Damage Detector is a web-based application that leverages Google Gemini AI to analyze vehicle damage from uploaded photos and provide comprehensive damage assessments, repair cost estimates in Indian Rupees (INR), and insurance claims guidance tailored to the Indian market. The system enables users to upload multiple vehicle images, receive AI-powered damage analysis with confidence scores, and generate detailed reports for insurance claim purposes.

## Glossary

- **System**: The AI Vehicle Damage Detector web application
- **User**: An individual using the application to analyze vehicle damage
- **Gemini_AI**: Google's Gemini AI API service used for image analysis and text generation
- **Damage_Analyzer**: The component responsible for processing images and detecting damage using Gemini AI
- **Claims_Generator**: The component that generates insurance claims guidance
- **Report_Exporter**: The component that converts analysis results to PDF format
- **Damage_Detail**: A data structure containing information about a specific damage instance
- **Damage_Analysis**: A comprehensive analysis result containing all detected damages and cost estimates
- **Claims_Information**: A data structure containing insurance claim guidance
- **Upload_Component**: The file upload interface component
- **INR**: Indian Rupees, the currency used for all cost estimates

## Requirements

### Requirement 1: Image Upload and Management

**User Story:** As a user, I want to upload multiple vehicle damage photos, so that I can get a comprehensive analysis of all visible damage.

#### Acceptance Criteria

1. WHEN a user selects image files, THE Upload_Component SHALL accept common image formats (JPEG, PNG, WebP)
2. WHEN multiple images are selected, THE System SHALL store all images for batch processing
3. WHEN an image is uploaded, THE System SHALL validate that the file is a valid image format
4. IF an invalid file is uploaded, THEN THE System SHALL display an error message and reject the file
5. WHEN images are uploaded, THE Upload_Component SHALL display preview thumbnails of all uploaded images

### Requirement 2: AI-Powered Damage Detection

**User Story:** As a user, I want the system to automatically detect and classify vehicle damage from my photos, so that I can understand the extent and types of damage.

#### Acceptance Criteria

1. WHEN images are submitted for analysis, THE Damage_Analyzer SHALL send images to Gemini AI (gemini-3-pro-preview model)
2. WHEN Gemini AI processes an image, THE Damage_Analyzer SHALL extract damage type, location, severity level, and confidence score
3. WHEN damage is detected, THE System SHALL classify damage types (dent, scratch, crack, broken part, paint damage, etc.)
4. WHEN damage is detected, THE System SHALL identify the specific vehicle location (front bumper, door, hood, etc.)
5. WHEN damage is detected, THE System SHALL assign a severity level (minor, moderate, severe)
6. WHEN analysis is complete, THE System SHALL provide a confidence score (0-100%) for each detected damage
7. WHEN analysis is complete, THE System SHALL provide an explanation for each damage detection

### Requirement 3: Cost Estimation

**User Story:** As a user, I want to receive repair cost estimates in Indian Rupees, so that I can understand the financial impact of the damage.

#### Acceptance Criteria

1. WHEN damage is analyzed, THE Damage_Analyzer SHALL estimate repair costs in INR for each damage instance
2. WHEN multiple damages are detected, THE System SHALL calculate a total estimated cost in INR
3. WHEN cost estimates are generated, THE System SHALL provide cost factors explaining the estimate
4. WHEN displaying costs, THE System SHALL format amounts in INR with appropriate currency symbols and formatting

### Requirement 4: Insurance Claims Guidance

**User Story:** As a user, I want to receive India-specific insurance claims guidance, so that I can understand how to file a claim for the detected damage.

#### Acceptance Criteria

1. WHEN damage analysis is complete, THE Claims_Generator SHALL use Gemini AI (gemini-3-flash-preview model) to generate claims guidance
2. WHEN claims guidance is generated, THE System SHALL identify eligible claim types based on detected damage
3. WHEN claims guidance is generated, THE System SHALL provide step-by-step claim filing procedures specific to Indian insurance practices
4. WHEN claims guidance is generated, THE System SHALL list all required documents for claim submission
5. WHEN claims guidance is generated, THE System SHALL tailor recommendations to Indian insurance regulations and procedures

### Requirement 5: Results Display and Reporting

**User Story:** As a user, I want to view detailed damage reports with all analysis results, so that I can review and share the findings.

#### Acceptance Criteria

1. WHEN analysis is complete, THE System SHALL display all detected damages in a structured report format
2. WHEN displaying damage details, THE System SHALL show damage type, location, severity, cost estimate, confidence score, and explanation for each damage
3. WHEN displaying the report, THE System SHALL show the total estimated repair cost prominently
4. WHEN displaying the report, THE System SHALL include cost factors and explanations
5. WHEN displaying claims guidance, THE System SHALL present eligible claims, procedures, and required documents in a clear format

### Requirement 6: PDF Export Functionality

**User Story:** As a user, I want to export the damage report and claims guidance as a PDF, so that I can share it with insurance companies or repair shops.

#### Acceptance Criteria

1. WHEN a user requests PDF export, THE Report_Exporter SHALL convert the displayed report to PDF format
2. WHEN generating PDF, THE System SHALL include all damage details, cost estimates, and claims guidance
3. WHEN generating PDF, THE System SHALL use html2canvas to capture visual elements
4. WHEN generating PDF, THE System SHALL use jsPDF to create the final PDF document
5. WHEN PDF generation is complete, THE System SHALL trigger a download of the PDF file

### Requirement 7: User Interface and Experience

**User Story:** As a user, I want an intuitive and responsive interface, so that I can easily navigate the application and understand the results.

#### Acceptance Criteria

1. THE System SHALL provide a Header component displaying application branding and navigation
2. WHEN processing is in progress, THE System SHALL display a LoadingSpinner component with appropriate status messages
3. WHEN displaying results, THE System SHALL organize information into clear sections (damage report, claims guidance)
4. THE System SHALL use responsive design principles to work on desktop and mobile devices
5. WHEN errors occur, THE System SHALL display user-friendly error messages

### Requirement 8: AI Integration and API Communication

**User Story:** As a system administrator, I want reliable integration with Google Gemini AI, so that the application can provide accurate analysis results.

#### Acceptance Criteria

1. THE System SHALL use the @google/genai SDK to communicate with Google Gemini AI API
2. WHEN analyzing damage, THE System SHALL use the gemini-3-pro-preview model for image analysis
3. WHEN generating claims guidance, THE System SHALL use the gemini-3-flash-preview model for text generation
4. WHEN API calls fail, THE System SHALL handle errors gracefully and inform the user
5. WHEN making API requests, THE System SHALL include appropriate prompts and parameters for optimal results

### Requirement 9: Data Structure and Type Safety

**User Story:** As a developer, I want well-defined TypeScript interfaces for all data structures, so that the application maintains type safety and code quality.

#### Acceptance Criteria

1. THE System SHALL define a DamageDetail interface with properties: damageType, location, severity, estimatedCostINR, confidenceScore, explanation
2. THE System SHALL define a DamageAnalysis interface with properties: damages array, totalEstimatedCostINR, costFactors
3. THE System SHALL define a ClaimsInformation interface with properties: eligibleClaims, claimProcedure, requiredDocuments
4. THE System SHALL enforce TypeScript strict mode for type checking
5. THE System SHALL use proper typing for all component props and function parameters

### Requirement 10: Application Build and Development

**User Story:** As a developer, I want a modern build system and development environment, so that I can efficiently develop and deploy the application.

#### Acceptance Criteria

1. THE System SHALL use Vite as the build tool for fast development and optimized production builds
2. THE System SHALL use React 19 as the UI framework
3. THE System SHALL use TypeScript for all application code
4. THE System SHALL organize code into modular components (FileUpload, DamageReport, ClaimsGuide, Chatbot, LoadingSpinner, Header)
5. THE System SHALL support hot module replacement during development

