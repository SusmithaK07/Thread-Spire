import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Image as ImageIcon, 
  Plus, 
  Type, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Save, 
  Eye, 
  ArrowRight, 
  X,
  Trash2,
  FileQuestion,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Heading1,
  Heading2,
  Quote
} from "lucide-react";
import ThreadPreviewCard from "./ThreadPreviewCard";
import SegmentEditor from "./SegmentEditor";
import "./editor-styles.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { threadService } from "@/lib/services/thread.service";
import { draftService } from "@/lib/services/draft.service";
import { previewService } from "@/lib/services/preview.service";
import { supabase } from "@/integrations/supabase/client";
import { EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface ThreadSegment {
  id: string;
  content: string;
  type: 'text';
}

interface ThreadData {
  id: string;
  title: string;
  coverImage: string | null;
  segments: ThreadSegment[];
  tags: string[];
  isPublic: boolean;
  lastSaved: Date | null;
  original_thread_id?: string;
}

const PREDEFINED_TAGS = [
  "Productivity",
  "Mindfulness",
  "Career",
  "Technology",
  "Creativity",
  "Health",
  "Philosophy",
  "Learning"
];

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const ThreadCreator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract URL parameters and log them for debugging
  const draftId = queryParams.get('draft');
  const forkId = queryParams.get('fork');
  const remixFrom = queryParams.get('remixFrom');
  const threadId = queryParams.get('thread');
  
  console.log('URL Parameters:', { draftId, forkId, remixFrom, threadId });
  console.log('Full URL:', location.pathname + location.search);
  
  const [thread, setThread] = useState<ThreadData>({
    id: generateId(),
    title: '',
    coverImage: null,
    segments: [{ id: generateId(), content: '', type: 'text' }],
    tags: [],
    isPublic: true,
    lastSaved: null
  });
  
  const [customTag, setCustomTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [showCoverImageField, setShowCoverImageField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [isEditingThread, setIsEditingThread] = useState(false);
  
  const TYPING_TITLE = "Create a New Thread";
  
  const [editors, setEditors] = useState<{ [id: string]: any }>({});
  
  // Typing animation effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(TYPING_TITLE.slice(0, i + 1));
      i++;
      if (i === TYPING_TITLE.length) {
        clearInterval(interval);
      }
    }, 70); // Adjust typing speed as needed
    return () => clearInterval(interval);
  }, []);

  // Load draft or fork if specified
  useEffect(() => {
    console.log('Loading thread effect triggered');
    
    const loadThread = async () => {
      console.log('Starting loadThread function with params:', { draftId, forkId, remixFrom, threadId });
      
      // Handle fork/remix
      if (forkId) {
        try {
          setIsLoading(true);
          // Load the original thread for pre-filling
          const threadData = await threadService.getThreadById(forkId);
          setThread({
            id: generateId(),
            title: threadData.title,
            coverImage: threadData.cover_image || null,
            segments: threadData.segments.map((seg: any) => ({
              id: generateId(),
              content: seg.content,
              type: 'text'
            })),
            tags: threadData.tags || [],
            isPublic: threadData.is_published,
            lastSaved: new Date(),
            original_thread_id: threadData.original_thread_id || forkId // for attribution
          });
          toast({
            title: "Thread remixed",
            description: "You're now working on a remix. Save or publish to create your own version.",
          });
        } catch (error) {
          console.error("Error loading thread for remix:", error);
          toast({
            title: "Error loading thread",
            description: "The thread could not be loaded. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }
      if (remixFrom) {
        try {
          setIsLoading(true);
          // Load the original thread for pre-filling
          const threadData = await threadService.getThreadById(remixFrom);
          setThread({
            id: generateId(),
            title: threadData.title,
            coverImage: threadData.cover_image || null,
            segments: threadData.segments.map((seg: any) => ({
              id: generateId(),
              content: seg.content,
              type: 'text'
            })),
            tags: threadData.tags || [],
            isPublic: threadData.is_published,
            lastSaved: new Date()
          });
          toast({
            title: "Thread remixed",
            description: "You're now working on a remix. Save or publish to create your own version.",
          });
        } catch (error) {
          console.error("Error loading thread for remix:", error);
          toast({
            title: "Error loading thread",
            description: "The thread could not be loaded. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }
      if (draftId && !forkId) {
        try {
          setIsLoading(true);
          console.log('Attempting to load draft with ID:', draftId);
          
          // Direct database query for maximum reliability
          const { data: draftData, error } = await supabase
            .from('drafts')
            .select('*')
            .eq('id', draftId)
            .single();
          
          if (error) {
            console.error('Error fetching draft:', error);
            throw error;
          }
          
          if (!draftData) {
            throw new Error('Draft not found');
          }
          
          console.log('Raw draft data from database:', draftData);
          
          // Parse content properly
          let segments: ThreadSegment[] = [];
          if (typeof draftData.content === 'string') {
            try {
              const parsed = JSON.parse(draftData.content);
              if (Array.isArray(parsed)) {
                segments = parsed.map((seg: any) => ({
                  id: seg.id || generateId(),
                  content: seg.content || '',
                  type: seg.type || 'text',
                }));
              } else {
                segments = [{ id: generateId(), content: draftData.content, type: 'text' }];
              }
            } catch {
              // If not JSON, treat as plain text
              segments = [{ id: generateId(), content: draftData.content, type: 'text' }];
            }
          } else if (Array.isArray(draftData.content)) {
            segments = draftData.content.map((seg: any) => ({
              id: seg.id || generateId(),
              content: seg.content || '',
              type: seg.type || 'text',
            }));
          } else {
            segments = [{ id: generateId(), content: '', type: 'text' }];
          }
          
          setThread({
            id: draftData.id,
            title: draftData.title || 'Untitled Draft',
            coverImage: null,
            segments: segments.length > 0 ? segments : [{ id: generateId(), content: '', type: 'text' }],
            tags: [],
            isPublic: false,
            lastSaved: draftData.updated_at ? new Date(draftData.updated_at) : null
          });
          toast({
            title: "Draft loaded",
            description: "Your draft has been loaded for editing.",
          });
        } catch (error) {
          console.error("Error loading draft:", error);
          toast({
            title: "Error loading draft",
            description: "The draft could not be loaded. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
        return;
      } else if (threadId) {
        try {
          setIsLoading(true);
          const threadData = await threadService.getThreadById(threadId);
          console.log('Loaded threadData:', threadData);
          console.log('Loaded segments:', threadData.segments);
          setThread({
            id: threadData.id,
            title: threadData.title,
            coverImage: threadData.cover_image || null,
            segments: Array.isArray(threadData.segments) && threadData.segments.length > 0
              ? threadData.segments
                  .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                  .map((seg: any) => {
                    console.log('Segment content:', seg.content);
                    return {
                      id: seg.id,
                      content: typeof seg.content === 'string' ? seg.content : '',
                      type: 'text'
                    };
                  })
              : [{ id: generateId(), content: '', type: 'text' }],
            tags: threadData.tags || [],
            isPublic: threadData.is_published,
            lastSaved: threadData.updated_at ? new Date(threadData.updated_at) : null
          });
          setIsEditingThread(true);
          toast({
            title: "Thread loaded",
            description: "Your thread has been loaded for editing.",
          });
        } catch (error) {
          console.error("Error loading thread for editing:", error);
          toast({
            title: "Error loading thread",
            description: "The thread could not be loaded. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }
    };
    loadThread();
  }, [draftId, forkId, remixFrom, threadId]);
  
  // Import the SegmentEditor component
  // This effect is only needed to reset editors when segments change completely
  useEffect(() => {
    // Clear editors when the segments array length changes
    setEditors({});
  }, [thread.segments.length]);
  
  // Handler for when an editor is created and ready
  const handleEditorReady = (segmentId: string, editor: any) => {
    setEditors(prev => ({
      ...prev,
      [segmentId]: editor
    }));
  };
  
  // Handler for when an editor is destroyed
  const handleEditorDestroy = (segmentId: string) => {
    setEditors(prev => {
      const newEditors = { ...prev };
      delete newEditors[segmentId];
      return newEditors;
    });
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThread(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleSegmentChange = (id: string, content: string) => {
    setThread(prev => ({
      ...prev,
      segments: prev.segments.map(segment => 
        segment.id === id ? { ...segment, content } : segment
      )
    }));
  };
  
  const handleAddSegment = () => {
    const newSegment = { id: generateId(), content: '', type: 'text' as const };
    setThread(prev => ({ ...prev, segments: [...prev.segments, newSegment] }));
  };
  
  const handleRemoveSegment = (id: string) => {
    if (thread.segments.length <= 1) {
      toast({
        title: "Cannot remove segment",
        description: "A thread must have at least one segment.",
        variant: "destructive"
      });
      return;
    }
    
    setThread(prev => ({
      ...prev,
      segments: prev.segments.filter(segment => segment.id !== id)
    }));
  };
  
  const handleSave = async (publish = false) => {
    try {
      setIsSaving(true);
      // Validate content
      if (!thread.title.trim()) {
        toast({
          title: "Title required",
          description: "Please add a title to your thread.",
          variant: "destructive"
        });
        return;
      }
      if (thread.segments.some(s => !s.content.trim())) {
        toast({
          title: "Empty segments",
          description: "Please fill in all segments or remove empty ones.",
          variant: "destructive"
        });
        return;
      }
      let segments = thread.segments.map((seg, index) => ({
        id: seg.id,
        content: seg.content,
        order_index: index
      }));
      // If remix, add attribution segment
      let originalAuthorName = '';
      if (thread.original_thread_id) {
        // Fetch original author name
        const originalThread = await threadService.getThreadById(thread.original_thread_id);
        originalAuthorName = originalThread?.author?.name || 'Unknown';
        segments = [
          ...segments,
          { id: generateId(), content: `Inspired by ${originalAuthorName}`, order_index: segments.length }
        ];
      }
      const threadData = {
        title: thread.title,
        segments,
        tags: thread.tags,
        is_published: publish,
        cover_image: thread.coverImage
      };
      let savedThread;
      if (isEditingThread) {
        // Update existing thread
        savedThread = await threadService.updateThread(
          thread.id,
          threadData
        );
      } else if (draftId && !forkId) {
        // Publishing a draft: create a new thread from the draft
        savedThread = await threadService.createThread(
          threadData.title,
          threadData.segments.map(s => s.content),
          threadData.tags,
          threadData.cover_image || undefined,
          true, // isPublished
          !thread.isPublic,
          thread.original_thread_id // pass for remix
        );
        await draftService.deleteDraft(draftId);
      } else {
        // Create new thread (normal flow)
        savedThread = await threadService.createThread(
          threadData.title,
          threadData.segments.map(s => s.content),
          threadData.tags,
          threadData.cover_image || undefined,
          publish,
          !thread.isPublic,
          thread.original_thread_id // pass for remix
        );
      }
      setThread(prev => ({ 
        ...prev, 
        id: savedThread.id,
        lastSaved: new Date()
      }));
      toast({
        title: publish ? "Thread published" : isEditingThread ? "Thread updated" : "Thread saved",
        description: publish 
          ? "Your thread has been published successfully." 
          : isEditingThread ? "Your thread has been updated." : "Your thread has been saved as a draft.",
      });
      if (publish) {
        navigate('/library');
      }
    } catch (error: any) {
      console.error("Error saving thread:", error);
      toast({
        title: "Error saving thread",
        description: error?.message || (typeof error === 'string' ? error : 'There was a problem saving your thread. Please try again.'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTagToggle = (tag: string) => {
    setThread(prev => {
      const exists = prev.tags.includes(tag);
      if (exists) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        if (prev.tags.length >= 5) {
          toast({
            title: "Maximum tags reached",
            description: "You can add up to 5 tags per thread.",
            variant: "destructive"
          });
          return prev;
        }
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };
  
  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    
    if (customTag.length > 20) {
      toast({
        title: "Tag too long",
        description: "Tags should be 20 characters or less.",
        variant: "destructive"
      });
      return;
    }
    
    if (thread.tags.includes(customTag)) {
      toast({
        description: "This tag already exists.",
        variant: "destructive"
      });
      return;
    }
    
    if (thread.tags.length >= 5) {
      toast({
        title: "Maximum tags reached",
        description: "You can add up to 5 tags per thread.",
        variant: "destructive"
      });
      return;
    }
    
    setThread(prev => ({ ...prev, tags: [...prev.tags, customTag] }));
    setCustomTag('');
  };
  
  const handleAddCoverImage = () => {
    if (!coverImageUrl.trim()) {
      return;
    }
    
    setThread(prev => ({ ...prev, coverImage: coverImageUrl }));
    setCoverImageUrl('');
    setShowCoverImageField(false);
  };
  
  const handlePrivacyChange = (isPublic: boolean) => {
    setThread(prev => ({ ...prev, isPublic }));
  };
  
  // Add this new function for saving drafts
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      if (!thread.title.trim()) {
        toast({
          title: "Title required",
          description: "Please add a title to your draft.",
          variant: "destructive"
        });
        return;
      }
      if (thread.segments.some(s => !s.content.trim())) {
        toast({
          title: "Empty segments",
          description: "Please fill in all segments or remove empty ones.",
          variant: "destructive"
        });
        return;
      }
      const content = thread.segments.map(seg => ({ content: seg.content, type: seg.type }));
      let savedDraft;
      if (draftId) {
        savedDraft = await draftService.updateDraft(draftId, thread.title, content);
      } else {
        savedDraft = await draftService.createDraft(thread.title, content);
      }
      setThread(prev => ({ ...prev, id: savedDraft.id, lastSaved: new Date() }));
      toast({ title: "Draft saved", description: "Your draft has been saved." });
    } catch (error: any) {
      toast({ title: "Error saving draft", description: error.message || "There was a problem saving your draft.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Place the loading check here, after all hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="relative">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10">
        {showPreview ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold font-playfair">Thread Preview</h1>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Editor
              </Button>
            </div>
            
            <div className="relative">
              <ThreadPreviewCard
                title={thread.title}
                coverImage={thread.coverImage}
                content={thread.segments.map(segment => segment.content || '')}
                tags={thread.tags}
                isPublic={thread.isPublic}
                authorName={previewData?.authorName}
                authorAvatar={previewData?.authorAvatar}
                createdAt={new Date()}
                onClose={() => setShowPreview(false)}
              />
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Editor
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Thread
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold font-playfair min-h-[2.5rem]">{typedTitle}</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  {thread.lastSaved 
                    ? `Last saved: ${new Date(thread.lastSaved).toLocaleTimeString()}`
                    : 'Not saved yet'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Thread Title and Cover Image */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Thread Title"
                      value={thread.title}
                      onChange={handleTitleChange}
                      className="text-3xl font-playfair w-full bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {thread.coverImage ? (
                      <div className="relative">
                        <img 
                          src={thread.coverImage} 
                          alt="Cover" 
                          className="h-12 w-20 object-cover rounded-md"
                        />
                        <button
                          onClick={() => setThread(prev => ({ ...prev, coverImage: null }))}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                          aria-label="Remove cover image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowCoverImageField(!showCoverImageField)}
                              className="bg-gradient-to-r from-purple-500/80 to-indigo-500/80 hover:from-purple-600/90 hover:to-indigo-600/90 text-white dark:text-white border-transparent hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <ImageIcon className="h-4 w-4 mr-1" />
                              Add Cover
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Add a cover image to your thread
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                
                {showCoverImageField && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter image URL"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-threadspire-gold"
                    />
                    <Button onClick={handleAddCoverImage} size="sm">Add</Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCoverImageField(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Thread Segments */}
              <div className="space-y-6">
                {thread.segments.map((segment, index) => {
                  const editor = editors[segment.id];
                  // Quick fix: ensure content is always a string
                  const safeContent = typeof segment.content === 'string' ? segment.content : '';
                  return (
                    <div key={segment.id} className="relative thread-segment mb-8">
                      <div className="mb-4 flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border/30">
                        <div className="flex flex-wrap gap-1 animate-fade-in">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleBold().run()} 
                                  data-active={editor?.isActive('bold')}
                                  className={editor?.isActive('bold') ? 'bg-muted' : ''}
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Bold</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleItalic().run()} 
                                  data-active={editor?.isActive('italic')}
                                  className={editor?.isActive('italic') ? 'bg-muted' : ''}
                                >
                                  <Italic className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Italic</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} 
                                  data-active={editor?.isActive('heading', { level: 1 })}
                                  className={editor?.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                                >
                                  <Heading1 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Heading 1</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} 
                                  data-active={editor?.isActive('heading', { level: 2 })}
                                  className={editor?.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                                >
                                  <Heading2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Heading 2</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleBulletList().run()} 
                                  data-active={editor?.isActive('bulletList')}
                                  className={editor?.isActive('bulletList') ? 'bg-muted' : ''}
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Bullet List</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleOrderedList().run()} 
                                  data-active={editor?.isActive('orderedList')}
                                  className={editor?.isActive('orderedList') ? 'bg-muted' : ''}
                                >
                                  <ListOrdered className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ordered List</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleLink().run()} 
                                  data-active={editor?.isActive('link')}
                                  className={editor?.isActive('link') ? 'bg-muted' : ''}
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Link</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().unsetLink().run()} 
                                  data-active={editor?.isActive('link')}
                                  className={editor?.isActive('link') ? 'bg-muted' : ''}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove Link</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().setTextAlign('left').run()} 
                                  data-active={editor?.isActive({ textAlign: 'left' })}
                                  className={editor?.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
                                >
                                  <Type className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Align Left</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().setTextAlign('center').run()} 
                                  data-active={editor?.isActive({ textAlign: 'center' })}
                                  className={editor?.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
                                >
                                  <Type className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Align Center</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().setTextAlign('right').run()} 
                                  data-active={editor?.isActive({ textAlign: 'right' })}
                                  className={editor?.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
                                >
                                  <Type className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Align Right</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().setTextAlign('justify').run()} 
                                  data-active={editor?.isActive({ textAlign: 'justify' })}
                                  className={editor?.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
                                >
                                  <Type className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Justify</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleUnderline().run()} 
                                  data-active={editor?.isActive('underline')}
                                  className={editor?.isActive('underline') ? 'bg-muted' : ''}
                                >
                                  <Underline className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Underline</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => editor?.chain().focus().toggleHighlight().run()} 
                                  data-active={editor?.isActive('highlight')}
                                  className={editor?.isActive('highlight') ? 'bg-muted' : ''}
                                >
                                  <Highlight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Highlight</TooltipContent>
                            </Tooltip>
                          </TooltipProvider> 
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveSegment(segment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <SegmentEditor 
                          segmentId={segment.id} 
                          content={safeContent} 
                          onReady={handleEditorReady} 
                          onDestroy={handleEditorDestroy} 
                          onChange={(content) => handleSegmentChange(segment.id, content)}
                        />
                      </div>
                      <div className="thread-segment-connector" />
                    </div>
                  );
                })}
                
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={handleAddSegment}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Segment
                  </Button>
                </div>
              </div>
              
              {/* Thread Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                {/* Tags Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Tags</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            thread.tags.includes(tag)
                              ? 'bg-threadspire-navy text-white'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom tag"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-threadspire-gold"
                        maxLength={20}
                      />
                      <Button 
                        size="sm"
                        disabled={!customTag.trim() || thread.tags.length >= 5}
                        onClick={handleAddCustomTag}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {thread.tags.map(tag => (
                        <div 
                          key={tag}
                          className="px-3 py-1 bg-threadspire-navy text-white dark:bg-threadspire-gold dark:text-threadspire-navy rounded-full text-xs flex items-center"
                        >
                          {tag}
                          <button
                            onClick={() => handleTagToggle(tag)}
                            className="ml-2 focus:outline-none"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {thread.tags.length >= 5 && (
                      <p className="text-xs text-muted-foreground">
                        Maximum of 5 tags reached.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Privacy Settings and Help */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Privacy</h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handlePrivacyChange(true)}
                        className={`px-4 py-2 rounded-md flex items-center ${
                          thread.isPublic ? 'bg-threadspire-navy text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => handlePrivacyChange(false)}
                        className={`px-4 py-2 rounded-md flex items-center ${
                          !thread.isPublic ? 'bg-threadspire-navy text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {thread.isPublic 
                        ? 'Public threads are visible to all users and can be featured on the explore page.'
                        : 'Private threads are only visible to you.'}
                    </p>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2">
                        <FileQuestion className="h-4 w-4" />
                        <span>Thread Creation Help</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-playfair">Creating a Great Thread</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium">Focus on Connections</h4>
                            <p className="text-sm text-muted-foreground">
                              Threads work best when each segment connects to the next one with a logical flow.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium">Keep Segments Focused</h4>
                            <p className="text-sm text-muted-foreground">
                              Each segment should contain one key idea. Use multiple segments for complex thoughts.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium">Choose Tags Carefully</h4>
                            <p className="text-sm text-muted-foreground">
                              Tags help others discover your thread. Be specific but not too niche.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium">Quality Over Quantity</h4>
                            <p className="text-sm text-muted-foreground">
                              A shorter, thoughtful thread is better than a long meandering one.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {thread.original_thread_id && (
                <div className="mb-4 p-3 bg-muted/50 rounded-md text-sm flex items-center">
                  <span className="text-muted-foreground mr-2">This will publish as a remix</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
                <div className="space-x-2">
                  <Button 
                    onClick={() => handleSave(true)} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        Publish
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadCreator;
