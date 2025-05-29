import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';

interface SegmentEditorProps {
  segmentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  onEditorReady: (id: string, editor: any) => void;
  onEditorDestroy: (id: string) => void;
}

const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segmentId,
  initialContent,
  onContentChange,
  onEditorReady,
  onEditorDestroy
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
      }),
      Link,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Placeholder.configure({
        placeholder: 'Write your thoughts here...',
        emptyEditorClass: 'is-editor-empty',
      })
    ],
    content: typeof initialContent === 'string' ? initialContent : '',
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full min-h-32 bg-transparent outline-none transition-all duration-200 rounded-md',
        style: 'border: 3px solid #8b5cf6; box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); border-radius: 8px; padding: 12px;',
      },
    },
  });

  // Register the editor with the parent component
  useEffect(() => {
    if (editor) {
      onEditorReady(segmentId, editor);
    }
    
    // Clean up on unmount
    return () => {
      if (editor) {
        onEditorDestroy(segmentId);
      }
    };
  }, [editor, segmentId, onEditorReady, onEditorDestroy]);

  return editor ? <EditorContent editor={editor} /> : null;
};

export default SegmentEditor;
