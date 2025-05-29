import React, { useState, useEffect } from 'react';
import { User, BookmarkIcon, Share, MessageSquare, GitFork, ExternalLink, FolderPlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ThreadSegment from './ThreadSegment';
import ReactionBar from './ReactionBar';
import RelatedThreads from '../discovery/RelatedThreads';
import { threadService } from '@/lib/services/thread.service';
import { bookmarkService } from '@/lib/services/bookmark.service';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { followService } from '@/lib/services/follow.service';
import ThreadRemixButton from './ThreadRemixButton';
import { localCollectionService } from '@/lib/services/local-collections.service';
import AddToCollectionDialog from '../collection/AddToCollectionDialog';
import { cleanHtmlForDisplay } from '@/lib/utils/html-utils';

interface ThreadReaderProps {
  threadId?: string;
}

const ThreadReader = ({ threadId: propThreadId }: ThreadReaderProps) => {
  const { threadId: paramThreadId } = useParams<{ threadId: string }>();
  const threadId = propThreadId || paramThreadId;
  const [thread, setThread] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forkLoading, setForkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [originalAuthor, setOriginalAuthor] = useState<{name: string, id: string, threadId: string} | null>(null);
  const [userCollections, setUserCollections] = useState<any[]>([]);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);

  const { toast } = useToast();
  const { isAuthenticated, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  // Handle scroll events to update reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load thread data, analytics, and author profile
  useEffect(() => {
    if (!threadId) return;

    const loadThread = async () => {
      try {
        setLoading(true);
        const threadData = await threadService.getThreadById(threadId);
        setThread(threadData);
        console.log('Thread Data:', threadData);
        
        // Fetch author profile
        if (threadData.user_id) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', threadData.user_id)
              .single();
            
            if (profileData) {
              setAuthorProfile({
                ...profileData,
                name: profileData.name || 'ThreadSpire User',
                avatar_url: profileData.avatar_url || '/placeholder-avatar.jpg'
              });
            } else if (profileError) {
              console.error('Error loading author profile:', profileError);
              setAuthorProfile({
                name: 'ThreadSpire User',
                avatar_url: '/placeholder-avatar.jpg'
              });
            }
          } catch (profileError) {
            console.error('Error loading author profile:', profileError);
            setAuthorProfile({
              name: 'ThreadSpire User',
              avatar_url: '/placeholder-avatar.jpg'
            });
          }
        }
        
        // If this is a remixed thread, fetch original author profile
        if (threadData.original_thread_id) {
          try {
            const originalThread = await threadService.getThreadById(threadData.original_thread_id);
            let originalAuthorName = '';
            if (originalThread && originalThread.user_id) {
              const { data: originalAuthorData } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', originalThread.user_id)
                .single();
              if (originalAuthorData && originalAuthorData.name) {
                originalAuthorName = originalAuthorData.name;
              } else {
                // Fallback: show 'ThreadSpire User' instead of user-xxxxxx
                originalAuthorName = 'ThreadSpire User';
              }
              setOriginalAuthor({
                name: originalAuthorName,
                id: originalThread.user_id,
                threadId: originalThread.id
              });
            }
          } catch (error) {
            console.error('Error loading original author:', error);
          }
        }
        
        // Check if thread is bookmarked (if user is authenticated)
        if (isAuthenticated) {
          const bookmarked = await bookmarkService.isBookmarked(threadId);
          setIsBookmarked(bookmarked);
        }
        
        // Get analytics data
        try {
          const analyticsData = await threadService.getThreadAnalytics(threadId);
          setAnalytics(analyticsData);
        } catch (analyticsError) {
          console.error('Error loading analytics:', analyticsError);
        }
      } catch (error) {
        console.error('Error loading thread:', error);
        setError('Failed to load thread. It may have been deleted or you don\'t have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    loadThread();

    // Subscribe to real-time updates
    const subscription = threadService.subscribeToThread(threadId, (updatedThread) => {
      setThread(updatedThread);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [threadId, isAuthenticated]);

  useEffect(() => {
    if (currentUser?.id && thread?.user_id) {
      followService.isFollowing(currentUser.id, thread.user_id).then(setIsFollowing);
    }
  }, [currentUser?.id, thread?.user_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-playfair font-semibold mb-4">Thread Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "This thread doesn't exist or has been removed."}</p>
        <Button onClick={() => navigate('/explore')}>Explore Threads</Button>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(thread.created_at));

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark threads",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(thread.id);
      } else {
        await bookmarkService.addBookmark(thread.id);
      }
      
      setIsBookmarked(!isBookmarked);
      
      toast({
        title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: isBookmarked ? "This thread has been removed from your bookmarks." : "This thread has been added to your bookmarks.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };
  
  const handleForkThread = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to remix threads",
        variant: "destructive",
      });
      return;
    }

    try {
      setForkLoading(true);
      const forkedThread = await threadService.forkThread(threadId!);
      toast({
        title: "Success",
        description: "Thread remixed successfully! You can now edit it.",
      });
      navigate(`/create?thread=${forkedThread.id}`);
    } catch (error) {
      console.error('Error forking thread:', error);
      toast({
        title: "Error",
        description: "Failed to remix thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setForkLoading(false);
    }
  };
  
  const handleAddToCollection = async (collectionId: string) => {
    try {
      await localCollectionService.addThreadToCollection(collectionId, thread.id);
      toast({
        title: "Success",
        description: "Thread added to collection!",
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: "Error",
        description: "Failed to add thread to collection",
        variant: "destructive",
      });
    }
  };

  const handleShareThread = () => {
    if (navigator.share) {
      navigator.share({
        title: thread.title,
        text: thread.title,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: "Link copied",
        description: "Thread link copied to clipboard!",
    });
    }
  };

  const handleFollow = async () => {
    if (currentUser?.id && thread?.user_id) {
      await followService.follow(currentUser.id, thread.user_id);
      setIsFollowing(true);
    }
  };

  const handleUnfollow = async () => {
    if (currentUser?.id && thread?.user_id) {
      await followService.unfollow(currentUser.id, thread.user_id);
      setIsFollowing(false);
    }
  };

  // Get author name and bio
  const authorName = thread?.author?.name || authorProfile?.name || 'Unknown Creator';
  const authorBio = authorProfile?.bio || thread?.author?.bio || 'No bio available';
  // Use a data URI for the placeholder avatar to avoid 404 errors
  const authorAvatar = thread?.author?.avatar || authorProfile?.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjFhNyA3IDAgMCAwLTE0IDB2LTJhNCA0IDAgMCAxIDQtNGg2YTQgNCAwIDAgMSA0IDR2MloiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=';

  // Sort segments by order_index before rendering
  const sortedSegments = thread.segments ? [...thread.segments].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)) : [];

  return (
    <article className="max-w-3xl mx-auto">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 z-50 w-full h-1 bg-border">
          <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

      {/* Thread Content */}
      <div className="py-8">
        {/* Thread Metadata */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{sortedSegments.length} segments</span>
                <span>•</span>
          <span>{analytics?.view_count || 0} views</span>
            </div>

          {/* Thread Title */}
        <h1 className="text-4xl font-playfair font-bold mb-6">{thread.title}</h1>
        
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-10 w-10">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback>
              <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="font-medium hover:underline">
                    {authorName}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">{authorName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {authorProfile?.bio || "No bio available"}
                    </p>
                    <div className="flex items-center pt-2">
                      {currentUser?.id !== thread?.user_id && (
                        isFollowing ? (
                          <Button variant="outline" size="sm" onClick={handleUnfollow}>Following</Button>
                        ) : (
                          <Button size="sm" onClick={handleFollow}>Follow</Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            </div>
            <div className="text-sm text-muted-foreground">
              {formattedDate}
            </div>
          </div>
          </div>

          {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
            {thread.tags.map((tag: string) => (
              <span 
                key={tag} 
              className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

        {/* Attribution to original thread if this is a fork */}
        {thread.original_thread_id && (
          <div className="mb-8 p-4 bg-secondary/20 border border-secondary/30 rounded-lg flex items-center gap-3">
            <span className="text-base mr-2" role="img" aria-label="sparkles">✨</span>
            <div>
              <span className="text-sm font-medium">Inspired by </span>
              <Link
                to={`/thread/${thread.original_thread_id}`}
                className="text-sm font-bold text-primary hover:underline"
              >
                {originalAuthor?.name}
              </Link>
            </div>
          </div>
        )}

        {/* Thread Segments */}
        <div className="space-y-12 mb-12 border-l-4 border-primary/10 pl-4">
          {sortedSegments.map((segment: any, index: number) => {
            // Clean the HTML content for display
            const processedContent = cleanHtmlForDisplay(segment.content);
            
            return (
              <div key={segment.id} className="relative">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {processedContent}
                </div>
                {isAuthenticated && (
                  <div className="mt-4">
                    <ReactionBar threadId={thread.id} segmentId={segment.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Author Card */}
        <div className="my-12 p-6 border border-border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4">About the Author</h3>
            <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback>
                <User className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>
            <div className="flex-1">
                <h4 className="text-md font-semibold mb-2">{authorName}</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                  {authorBio}
                </p>
                {currentUser?.id !== thread?.user_id && (
                  isFollowing ? (
                  <Button variant="outline" size="sm" onClick={handleUnfollow}>Following</Button>
                  ) : (
                  <Button size="sm" onClick={handleFollow}>Follow</Button>
                  )
                )}
            </div>
          </div>
        </div>

        {/* Engagement Bar */}
        <div className="sticky bottom-4 mt-10 w-fit mx-auto px-6 py-3 rounded-full shadow-md bg-card border border-border flex items-center gap-6">          
          <button
            className="flex items-center gap-1 relative group"
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <BookmarkIcon className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : 'text-foreground'}`} />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isBookmarked ? "Remove bookmark" : "Bookmark"}
            </span>
          </button>
          
          <button 
            className="flex items-center gap-1 relative group"
            onClick={handleShareThread}
            aria-label="Share thread"
          >
            <Share className="h-5 w-5" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Share
            </span>
          </button>
          
          <div className="relative group">
            <ThreadRemixButton
              threadId={thread.id}
              authorName={authorName}
              compact={true}
              variant="ghost"
            />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Remix
            </span>
          </div>
          
          <button
            className="flex items-center gap-1 relative group"
            onClick={() => setShowCollectionDialog(true)}
            aria-label="Add to collection"
          >
            <FolderPlus className="h-5 w-5" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Add to collection
            </span>
          </button>
        </div>

        {/* Related Threads */}
        <section className="mt-16">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Related Threads</h2>
          <div className="flex flex-col gap-4">
            <RelatedThreads threadId={thread.id} tags={thread.tags} />
          </div>
        </section>
        
        {/* Add to Collection Dialog */}
        <AddToCollectionDialog
          open={showCollectionDialog}
          onOpenChange={setShowCollectionDialog}
          threadId={thread.id}
        />
      </div>
    </article>
  );
};

export default ThreadReader;
