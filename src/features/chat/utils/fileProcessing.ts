/**
 * Restructuring note:
 * File-processing helpers extracted from `useChat.ts` to keep the hook focused
 * on orchestration. These utilities encapsulate resume import detection and
 * template generation logic without side-effects other than provided setters.
 */

import type {
  FileAttachment,
  ProcessingResult,
  User,
} from '@/features/chat/types';

export function processFileAttachments(
  attachments: FileAttachment[],
  markdownContent: string,
  setDocumentTitle: (title: string) => void,
): ProcessingResult {
  let updatedMarkdown = markdownContent;
  let responseMessage = "I've updated your resume!";

  const resumeFile = attachments.find(
    (att) =>
      att.name.toLowerCase().includes('resume') ||
      att.name.toLowerCase().includes('cv') ||
      att.content,
  );

  if (resumeFile && resumeFile.content) {
    updatedMarkdown = resumeFile.content;
    responseMessage = `Great! I've imported your resume from "${resumeFile.name}". I can help you improve it, add new sections, or make any changes you need. What would you like to work on?`;
  } else {
    responseMessage = `I've received your file(s). Let me help you create or improve your resume. What would you like me to focus on?`;
  }

  return { updatedMarkdown, responseMessage };
}

export function createResumeTemplate(user: User): ProcessingResult {
  const updatedMarkdown = `# ${user.name}

**Your Job Title**

📧 ${user.email} | 📱 (555) 123-4567 | 🌐 linkedin.com/in/yourname

---

## Professional Summary

[Add a brief summary of your professional background and key achievements]

---

## Professional Experience

### Company Name - Job Title
**Start Date - End Date** | Location

- [Add your key responsibilities and achievements]
- [Use action verbs and quantify results when possible]
- [Include specific technologies, tools, or methodologies you used]

---

## Education

**Degree Name**
University Name | Graduation Year

---

## Skills

- **Technical Skills**: [Add relevant technical skills]
- **Languages**: [Add languages you speak]
- **Certifications**: [Add any relevant certifications]

---

*This is a template to get you started. Feel free to customize it with your information!*`;

  const responseMessage =
    "I've created a resume template for you! You can edit it directly or tell me about your experience and I'll help you fill it out. What would you like to add first?";
  return { updatedMarkdown, responseMessage };
}

export function applyOfflineHeuristics(
  message: string,
  markdownContent: string,
): ProcessingResult | null {
  let updatedMarkdown = markdownContent;
  let responseMessage = "I've updated your resume!";

  if (
    message.toLowerCase().includes('add') &&
    message.toLowerCase().includes('skill')
  ) {
    const skillMatch = message.match(/add.*skill[s]?.*?([a-zA-Z\s,\.]+)/i);
    if (skillMatch) {
      const skills = skillMatch[1].trim();
      if (
        updatedMarkdown.includes('## Skills') ||
        updatedMarkdown.includes('**Technical Skills**')
      ) {
        updatedMarkdown = updatedMarkdown.replace(
          '- **Technical Skills**: [Add relevant technical skills]',
          `- **Technical Skills**: ${skills}`,
        );
      } else {
        updatedMarkdown += `\n\n## Skills\n\n- **Technical Skills**: ${skills}`;
      }
      responseMessage = `Added skills: ${skills}`;
      return { updatedMarkdown, responseMessage };
    }
  }

  // Inferred intent: user pasted experience/bullets -> scaffold into resume experience section
  const bulletLines = message
    .split(/\r?\n/)
    .filter((l) => /^\s*[-*•]/.test(l.trim()));
  const mentionsExperience =
    /\bexperience\b|\bworked at\b|\bresponsibilit(y|ies)\b/i.test(message);
  const mentionsDates =
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+20\d{2}|20\d{2}\s*-\s*(Present|20\d{2})/i.test(
      message,
    );

  if (
    (bulletLines.length >= 2 || mentionsExperience || mentionsDates) &&
    message.trim().length > 80
  ) {
    const experienceContent = message.trim();
    if (!updatedMarkdown || updatedMarkdown.trim() === '') {
      updatedMarkdown = `# Your Name\n\n**Your Job Title**\n\n📧 your.email@example.com | 📱 (555) 123-4567 | 🌐 linkedin.com/in/yourname\n\n---\n\n## Professional Summary\n\n[Add a brief summary]\n\n---\n\n## Professional Experience\n\n${experienceContent}\n\n---\n\n## Education\n\n[Add education]\n\n---\n\n## Skills\n\n- **Technical Skills**: [Add relevant technical skills]`;
    } else {
      if (updatedMarkdown.includes('## Professional Experience')) {
        updatedMarkdown = updatedMarkdown.replace(
          /## Professional Experience[\s\S]*?(?=(\n## |$))/,
          (match) => `${match.trim()}\n\n${experienceContent}\n\n`,
        );
      } else {
        updatedMarkdown += `\n\n## Professional Experience\n\n${experienceContent}`;
      }
    }
    responseMessage =
      "I inferred you want me to incorporate your experience details. I've added them under Professional Experience. Review for accuracy and tell me what to adjust.";
    return { updatedMarkdown, responseMessage };
  }

  return null;
}
