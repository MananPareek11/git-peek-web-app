import React from 'react';
import styles from './MarkdownViewer.module.css';

/**
 * Lightweight Markdown Parser and Renderer
 * Converts Markdown text into rich HTML elements safely.
 */
export const MarkdownViewer = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  lines.forEach((line, idx) => {
    // Toggle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${idx}`} className={styles.codeBlock}>
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={idx} className={styles.h1}>{parseInline(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={idx} className={styles.h2}>{parseInline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={idx} className={styles.h3}>{parseInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('#### ')) {
      elements.push(<h3 key={idx} className={styles.h3}>{parseInline(trimmed.slice(5))}</h3>);
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      elements.push(<blockquote key={idx} className={styles.blockquote}>{parseInline(trimmed.slice(2))}</blockquote>);
    }
    // Horizontal Rule
    else if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={idx} className={styles.hr} />);
    }
    // Unordered List Items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <ul key={idx} className={styles.ul}>
          <li className={styles.li}>{parseInline(trimmed.slice(2))}</li>
        </ul>
      );
    }
    // Paragraph
    else if (trimmed.length > 0) {
      elements.push(<p key={idx} className={styles.p}>{parseInline(line)}</p>);
    }
  });

  return <div className={styles.markdownContainer}>{elements}</div>;
};

/**
 * Parses inline formatting like **bold**, `code`, and [links](url)
 */
function parseInline(text) {
  if (!text) return '';

  // Match inline code, bold, links
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ color: '#f8fafc' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const labelEnd = part.indexOf('](');
      const label = part.slice(1, labelEnd);
      const url = part.slice(labelEnd + 2, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

export default MarkdownViewer;
