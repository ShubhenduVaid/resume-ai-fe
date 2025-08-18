import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Upload, FileText, Linkedin, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<
    'file' | 'linkedin' | null
  >(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingType('file');

    try {
      let content: string;

      if (file.type === 'application/pdf') {
        // For PDF files, show a helpful message since we can't reliably extract text
        content = `# Resume

*PDF file "${file.name}" was uploaded*

**Note**: PDF text extraction is not available in this demo. Please:
1. Copy and paste your resume content directly into the editor, or
2. Upload a .txt or .docx file instead, or  
3. Use the LinkedIn import option below

## Professional Summary
[Add your professional summary here]

## Experience
[Add your work experience here]

## Education
[Add your education here]

## Skills
[Add your skills here]`;
      } else {
        // For non-PDF files, read as text
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      // Convert content to markdown format
      const markdownContent =
        file.type === 'application/pdf'
          ? content
          : convertToMarkdown(content, file);

      onFileUpload(markdownContent, file.name);
    } catch (error) {
      console.error('Error processing file:', error);
      // Fallback for error cases
      onFileUpload(
        `# Resume\n\n*Error processing "${file.name}"*\n\nPlease try:\n- Copying and pasting your content directly\n- Using a different file format (.txt, .docx)\n- Using the LinkedIn import option`,
        file.name,
      );
    } finally {
      setIsProcessing(false);
      setProcessingType(null);

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLinkedInImport = async () => {
    setIsProcessing(true);
    setProcessingType('linkedin');

    try {
      // Simulate LinkedIn API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const linkedinData = generateMockLinkedInData();
      onFileUpload(linkedinData, 'LinkedIn Profile');
    } catch (error) {
      console.error('Error importing from LinkedIn:', error);
      onFileUpload(
        '# Resume\n\n*Error importing from LinkedIn*\n\nPlease try again or add your information manually.',
        'LinkedIn Error',
      );
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const generateMockLinkedInData = (): string => {
    return `# Sarah Chen

**Senior Product Manager** • Google
📍 San Francisco, CA • 📧 sarah.chen@email.com • 📱 (555) 987-6543
[linkedin.com/in/sarahchen](https://linkedin.com/in/sarahchen) • [github.com/sarahchen](https://github.com/sarahchen)

---

## Professional Summary

Results-driven Senior Product Manager with 7+ years of experience leading cross-functional teams to deliver innovative products that serve millions of users. Expertise in product strategy, user research, data analysis, and agile development. Proven track record of launching successful products that drive significant business growth and user engagement.

---

## Professional Experience

### Google - Senior Product Manager
**March 2021 - Present** | San Francisco, CA

- Lead product strategy for Google Photos AI features, serving 1B+ monthly active users
- Launched 5 major AI-powered features resulting in 25% increase in user engagement
- Collaborate with engineering, design, and research teams across 3 time zones
- Define product roadmap and KPIs, managing $50M annual budget
- **Key Achievement**: Led initiative that increased photo sharing by 40% and retention by 18%

### Meta - Product Manager
**June 2019 - February 2021** | Menlo Park, CA

- Managed Instagram Shopping product suite with 200M+ monthly users
- Partnered with business teams to define go-to-market strategy for new commerce features
- Conducted user research and A/B testing to optimize conversion funnel
- Achieved 35% increase in merchant onboarding and 28% boost in shopping engagement
- Coordinated product launches across iOS, Android, and web platforms

### Airbnb - Associate Product Manager
**August 2017 - May 2019** | San Francisco, CA

- Worked on host onboarding experience, improving conversion rate by 22%
- Analyzed user behavior data to identify product improvement opportunities
- Collaborated with international teams to localize product features for global markets
- Managed product requirements and sprint planning for engineering team of 8 developers

### Startup Co. - Product Marketing Manager
**June 2016 - July 2017** | San Francisco, CA

- Launched go-to-market strategy for B2B SaaS platform targeting mid-market companies
- Created product positioning and messaging that increased trial-to-paid conversion by 45%
- Developed competitive intelligence reports and customer success case studies
- Managed product marketing budget of $2M across digital and field marketing campaigns

---

## Education

**Master of Business Administration (MBA)**
Stanford Graduate School of Business | 2014 - 2016
- Concentration: Technology and Innovation Management
- Relevant Coursework: Product Management, Data Analytics, Digital Strategy

**Bachelor of Science in Computer Science**
University of California, Berkeley | 2010 - 2014
- Minor in Business Administration
- Graduated Magna Cum Laude, GPA: 3.8/4.0

---

## Core Competencies

- **Product Strategy & Vision**: Roadmap planning, competitive analysis, market research
- **Data & Analytics**: SQL, Python, Tableau, Google Analytics, A/B testing, statistical analysis
- **Technical Skills**: API design, web technologies, mobile development, cloud platforms
- **Leadership & Collaboration**: Cross-functional team leadership, stakeholder management, agile methodologies
- **Business Acumen**: P&L management, budget planning, go-to-market strategy, pricing strategy

---

## Certifications & Training

- **Product Management Certificate** - Stanford Continuing Studies (2020)
- **Google Analytics Certified** - Google (2021)
- **Certified Scrum Product Owner (CSPO)** - Scrum Alliance (2019)
- **SQL for Data Science** - Coursera/University of California, Davis (2018)

---

## Key Projects & Achievements

### AI-Powered Photo Organization (Google Photos)
- **Challenge**: Users struggled to find specific photos in large libraries
- **Solution**: Led development of smart album creation and photo search features
- **Impact**: 60% improvement in photo discoverability, 30% increase in app usage time

### Instagram Shopping Discovery
- **Challenge**: Low product discovery rates on Instagram platform
- **Solution**: Designed personalized shopping feed using ML recommendations
- **Impact**: 85% increase in product clicks, $500M+ in attributed revenue

### Global Host Experience Optimization (Airbnb)
- **Challenge**: Inconsistent host onboarding across international markets
- **Solution**: Redesigned onboarding flow with localized content and support
- **Impact**: 22% increase in host conversion, expansion to 15 new countries

---

## Awards & Recognition

- **Product Excellence Award** - Google (2022, 2023)
- **Top Performer Award** - Meta (2020)
- **Innovation Award** - Airbnb (2018)
- **Dean's List** - UC Berkeley (2012, 2013, 2014)

---

*Imported from LinkedIn Profile*
*Please review and edit as needed*`;
  };

  const convertToMarkdown = (content: string, file: File): string => {
    if (file.name.endsWith('.md')) {
      return content;
    }

    // Clean up the content - remove extra whitespace and normalize
    let cleanedContent = content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .trim();

    // Split into lines and filter out empty ones
    let lines = cleanedContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let markdown = '';
    let inSkillsSection = false;
    let inExperienceSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
      const prevLine = lines[i - 1] || '';

      // Skip very short lines that might be noise
      if (line.length < 2) continue;

      // Detect name/title (first substantial line or lines that look like names)
      if (i === 0 || (i < 3 && line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/))) {
        markdown += `# ${line}\n\n`;
        continue;
      }

      // Detect section headers
      if (isLikelySectionHeader(line, nextLine, prevLine)) {
        const cleanHeader = line.replace(/[:\-\s]+$/, '').trim();
        markdown += `## ${cleanHeader}\n\n`;

        // Track sections for better formatting
        inSkillsSection = cleanHeader.toLowerCase().includes('skill');
        inExperienceSection =
          cleanHeader.toLowerCase().includes('experience') ||
          cleanHeader.toLowerCase().includes('work');
        continue;
      }

      // Detect job titles and companies
      if (inExperienceSection && isLikelyJobTitle(line)) {
        markdown += `### ${line}\n`;
        continue;
      }

      // Detect dates
      if (line.match(/\b(20\d{2}|19\d{2})\b.*\b(20\d{2}|19\d{2}|present)\b/i)) {
        markdown += `**${line}**\n\n`;
        continue;
      }

      // Detect bullet points or achievements
      if (
        line.match(/^[•\-\*]/) ||
        (inExperienceSection && line.match(/^[A-Z].*[^.]$/))
      ) {
        if (
          !line.startsWith('- ') &&
          !line.startsWith('• ') &&
          !line.startsWith('* ')
        ) {
          markdown += `- ${line}\n`;
        } else {
          markdown += `${line}\n`;
        }
        continue;
      }

      // Skills formatting
      if (inSkillsSection && line.includes(',')) {
        const skills = line.split(',').map((s) => s.trim());
        markdown += skills.map((skill) => `- ${skill}`).join('\n') + '\n\n';
        continue;
      }

      // Regular paragraphs
      markdown += `${line}\n\n`;
    }

    // Clean up extra newlines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Add import notice
    markdown += `\n---\n\n*Imported from ${file.name}*\n*Please review and edit as needed*`;

    return markdown;
  };

  const isLikelySectionHeader = (
    line: string,
    nextLine: string,
    prevLine: string,
  ): boolean => {
    // Common section headers
    const commonSections = [
      'experience',
      'education',
      'skills',
      'summary',
      'objective',
      'projects',
      'certifications',
      'achievements',
      'awards',
      'languages',
      'interests',
      'professional summary',
      'work experience',
      'technical skills',
      'core competencies',
    ];

    const lowerLine = line.toLowerCase();

    // Check if it matches common section names
    if (commonSections.some((section) => lowerLine.includes(section))) {
      return true;
    }

    // Check if it's a short line (potential header) followed by content
    if (line.length < 50 && nextLine && nextLine.length > line.length) {
      return true;
    }

    // Check if it's in ALL CAPS and short
    if (line === line.toUpperCase() && line.length < 30 && line.length > 3) {
      return true;
    }

    return false;
  };

  const isLikelyJobTitle = (line: string): boolean => {
    const jobTitlePatterns = [
      /\b(engineer|developer|manager|director|analyst|designer|architect|specialist|consultant)\b/i,
      /\b(senior|junior|lead|principal|staff|associate)\b/i,
      /at\s+[A-Z][a-zA-Z\s&,]+$/i, // "Position at Company"
    ];

    return jobTitlePatterns.some((pattern) => pattern.test(line));
  };

  return (
    <div className="space-y-3">
      {/* File Import Option */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors">
        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-3">Import from file</p>
        <Button
          onClick={handleFileSelect}
          variant="outline"
          size="sm"
          disabled={isProcessing}
          className="text-sm border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 disabled:opacity-50"
        >
          {isProcessing && processingType === 'file' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </>
          )}
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          Supports .txt, .md, .docx, .pdf files
        </p>
      </div>

      {/* LinkedIn Import Option */}
      <div className="border-2 border-dashed border-blue-100 rounded-lg p-4 text-center hover:border-blue-200 transition-colors bg-blue-50/30">
        <Linkedin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-3">
          Import from LinkedIn profile
        </p>
        <Button
          onClick={handleLinkedInImport}
          variant="outline"
          size="sm"
          disabled={isProcessing}
          className="text-sm border-blue-200 text-blue-700 hover:text-blue-900 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
        >
          {isProcessing && processingType === 'linkedin' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Linkedin className="w-4 h-4 mr-2" />
              Import from LinkedIn
            </>
          )}
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          Generates sample professional resume
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".txt,.md,.doc,.docx,.pdf"
        className="hidden"
      />
    </div>
  );
}
