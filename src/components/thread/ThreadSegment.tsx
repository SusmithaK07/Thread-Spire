import React from 'react';
import { cleanHtmlForDisplay } from '@/lib/utils/html-utils';

interface Segment {
  id: string;
  content: string;
  type: string;
}

interface ThreadSegmentProps {
  segment: Segment;
  isLast: boolean;
}

const ThreadSegment = ({ segment }: ThreadSegmentProps) => {
  // Clean the HTML content for display
  const processedContent = cleanHtmlForDisplay(segment.content);
  
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {processedContent}
    </div>
  );
};

export default ThreadSegment;
