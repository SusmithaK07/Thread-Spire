/**
 * Utility functions for handling HTML content
 */

/**
 * Completely removes all HTML tags from a string
 * @param html The HTML string to strip tags from
 * @returns Plain text with all HTML tags removed
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // First replace common HTML entities
  const withEntitiesReplaced = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Then strip all HTML tags
  return withEntitiesReplaced.replace(/<[^>]*>/g, '');
}

/**
 * Removes HTML tags only at the beginning and ending of the string
 * @param html The HTML string to process
 * @returns String with surrounding HTML tags removed, but inner content preserved
 */
export function removeSurroundingHtmlTags(html: string): string {
  if (!html) return '';
  
  // First replace common HTML entities
  let content = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  // Specifically check for and remove <p> and </p> tags at the beginning and end
  // First, handle the case where the content starts with <p> and ends with </p>
  if (content.match(/^\s*<p>/i) && content.match(/<\/p>\s*$/i)) {
    content = content.replace(/^\s*<p>\s*/i, '').replace(/\s*<\/p>\s*$/i, '');
    return content;
  }
  
  // Handle any other opening tag at the beginning
  content = content.replace(/^\s*<[^>]+>\s*/m, '');
  
  // Handle any other closing tag at the end
  content = content.replace(/\s*<\/[^>]+>\s*$/m, '');
  
  return content;
}

/**
 * Safely renders HTML by first converting entities and then using dangerouslySetInnerHTML
 * @param html The HTML string to process
 * @returns Processed HTML string ready for rendering
 */
export function processHtmlForRendering(html: string): string {
  if (!html) return '';
  
  // Replace HTML entities with actual characters
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Completely removes paragraph tags and their display from content
 * This is specifically designed to fix paragraph tags being displayed as text
 */
export function removeDisplayedHtmlTags(content: string): string {
  if (!content) return '';
  
  // Replace literal tag text that appears in the content
  let processedContent = content
    // First handle the exact format seen in the screenshots
    .replace(/&lt;p&gt;|<p>|<p>|<\/p>|&lt;\/p&gt;|<\/p>|<p>|<\/p>/gi, '')
    // Handle the case where tags are showing with their brackets
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '')
    // Also handle the entity-encoded versions
    .replace(/&lt;p&gt;/gi, '')
    .replace(/&lt;\/p&gt;/gi, '')
    // Handle literal strings like "<p>" and "</p>" that might be displayed
    .replace(/&quot;&lt;p&gt;&quot;|"<p>"|'<p>'|"&lt;p&gt;"|'&lt;p&gt;'/gi, '')
    .replace(/&quot;&lt;\/p&gt;&quot;|"<\/p>"|'<\/p>'|"&lt;\/p&gt;"|'&lt;\/p&gt;'/gi, '');
  
  // Remove any remaining HTML tags or entities
  return processedContent.replace(/&lt;([^&]*)&gt;|<([^>]*)>/gi, '');
}

/**
 * Aggressively removes all visible paragraph tags from text
 * This function is meant for direct use in JSX rendering where paragraph tags are showing
 */
export function stripVisibleTags(content: string): string {
  if (!content) return '';
  
  // Convert to string to ensure we're working with text
  content = String(content);
  
  // Step 1: Replace all literal versions of <p> and </p>
  let result = content;
  
  // Handle all variations of opening paragraph tag
  result = result.replace(/<p>|<p |<P>|<P |&lt;p&gt;|&lt;p |&lt;P&gt;|&lt;P /g, '');
  
  // Handle all variations of closing paragraph tag
  result = result.replace(/<\/p>|<\/P>|&lt;\/p&gt;|&lt;\/P&gt;/g, '');
  
  // Step 2: Replace HTML entity encoded versions
  result = result.replace(/&lt;p.*?&gt;/g, '');
  result = result.replace(/&lt;\/p.*?&gt;/g, '');
  
  // Step 3: Remove any remaining HTML entities
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#39;/g, "'");
  
  return result;
}

/**
 * Properly prepares HTML content for rendering with dangerouslySetInnerHTML
 * This function ensures paragraph tags are properly rendered and not displayed as text
 * @param content The HTML content to process
 * @returns Properly formatted HTML ready for rendering
 */
export function renderHtmlContent(content: string): string {
  if (!content) return '';
  
  // Convert to string to ensure we're working with text
  content = String(content);
  
  // Step 1: Replace HTML entity encoded versions of tags with actual tags
  let result = content
    .replace(/&lt;p&gt;/g, '<p>')
    .replace(/&lt;\/p&gt;/g, '</p>')
    .replace(/&lt;h([1-6])&gt;/g, '<h$1>')
    .replace(/&lt;\/h([1-6])&gt;/g, '</h$1>')
    .replace(/&lt;strong&gt;/g, '<strong>')
    .replace(/&lt;\/strong&gt;/g, '</strong>')
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>')
    .replace(/&lt;ul&gt;/g, '<ul>')
    .replace(/&lt;\/ul&gt;/g, '</ul>')
    .replace(/&lt;ol&gt;/g, '<ol>')
    .replace(/&lt;\/ol&gt;/g, '</ol>')
    .replace(/&lt;li&gt;/g, '<li>')
    .replace(/&lt;\/li&gt;/g, '</li>')
    .replace(/&lt;blockquote&gt;/g, '<blockquote>')
    .replace(/&lt;\/blockquote&gt;/g, '</blockquote>')
    .replace(/&lt;a\s+href="([^"]+)"&gt;/g, '<a href="$1">')
    .replace(/&lt;\/a&gt;/g, '</a>');
  
  // Step 2: Replace any remaining HTML entities
  result = result
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Step 3: Ensure content is wrapped in a paragraph tag if it doesn't already have block-level elements
  if (!result.match(/<(p|h[1-6]|ul|ol|blockquote|div)[^>]*>/i)) {
    result = `<p>${result}</p>`;
  }
  
  return result;
}

/**
 * Simple function to clean HTML content just before display
 * Uses regex to strip HTML tags from the beginning and end of content
 * @param content The HTML content to process
 * @returns Cleaned HTML content ready for display
 */
export function cleanHtmlForDisplay(content: string): string {
  if (!content) return '';
  
  // Convert to string to ensure we're working with text
  content = String(content);
  
  // Replace HTML entity encoded versions with actual characters
  let result = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // First directly handle the most common visible HTML tags
  result = result
    .replace(/<p>|<p\s+[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<h[1-6]>|<h[1-6]\s+[^>]*>/gi, '')
    .replace(/<\/h[1-6]>/gi, '')
    .replace(/<div>|<div\s+[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    .replace(/<span>|<span\s+[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<strong>|<strong\s+[^>]*>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<em>|<em\s+[^>]*>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/<a[^>]*>/gi, '')
    .replace(/<\/a>/gi, '')
    .replace(/<ul>|<ul\s+[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol>|<ol\s+[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<li>|<li\s+[^>]*>/gi, '')
    .replace(/<\/li>/gi, '')
    .replace(/<br>|<br\s*\/>/gi, ' ');
  
  // Then use a catch-all for any remaining HTML tags
  result = result.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Clean up any excessive whitespace
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}
