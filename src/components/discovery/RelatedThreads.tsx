import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { threadService } from '@/lib/services/thread.service';
import { supabase } from '@/integrations/supabase/client';
import { stripVisibleTags } from '@/lib/utils/html-utils';

interface RelatedThreadsProps {
  threadId: string;
  tags: string[];
}

const RelatedThreads = ({ threadId, tags }: RelatedThreadsProps) => {
  const [relatedThreads, setRelatedThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTags, setCurrentTags] = useState<string[]>(tags);
  const [profileMap, setProfileMap] = useState<Record<string, { name: string, avatarUrl: string }>>({});

  useEffect(() => {
    const loadThreadData = async () => {
      if (!threadId) return;
      
      try {
        const threadData = await threadService.getThreadById(threadId);
        if (threadData.tags && threadData.tags.length > 0) {
          setCurrentTags(threadData.tags);
        }
      } catch (error) {
        console.error('Error loading thread data:', error);
      }
    };
    
    if (tags.length === 0) {
      loadThreadData();
    }
  }, [threadId, tags]);

  useEffect(() => {
    const loadRelatedThreads = async () => {
      if (!currentTags || currentTags.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all published threads
        const { threads } = await threadService.getThreads({
          onlyPublished: true,
          limit: 20 // Get more threads to filter from
        });

        // Filter threads that have at least one matching tag with the current thread
        const threadsWithMatchingTags = threads.filter(thread => {
          // Skip the current thread
          if (thread.id === threadId) return false;
          
          // Check if this thread has any tags that match the current thread's tags
          return thread.tags.some(tag => currentTags.includes(tag));
        });
        
        // Sort by number of matching tags (most matches first)
        const sortedThreads = threadsWithMatchingTags.sort((a, b) => {
          const aMatchCount = a.tags.filter(tag => currentTags.includes(tag)).length;
          const bMatchCount = b.tags.filter(tag => currentTags.includes(tag)).length;
          return bMatchCount - aMatchCount;
        });
        
        const relatedThreadsData = sortedThreads.slice(0, 3); // Take at most 3 related threads
        setRelatedThreads(relatedThreadsData);
        
        // Fetch profiles for all thread authors
        const userIds = relatedThreadsData.map(thread => thread.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', userIds);
            
          const profileData: Record<string, { name: string, avatarUrl: string }> = {};
          profiles?.forEach(profile => {
            profileData[profile.id] = {
              name: profile.name || 'ThreadSpire User',
              avatarUrl: profile.avatar_url || '/placeholder-avatar.jpg'
            };
          });
          setProfileMap(profileData);
        }
      } catch (error) {
        console.error('Error loading related threads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedThreads();
  }, [threadId, currentTags]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[140px] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (relatedThreads.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No related threads found.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {relatedThreads.map(thread => {
        // Format date
        const formattedDate = new Date(thread.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Calculate total reactions
        const reactionTotal = Object.values(thread.reaction_counts || {}).reduce(
          (sum: number, count: any) => sum + (Number(count) || 0), 
          0
        );
        
        return (
          <Card key={thread.id} className="p-4 hover:shadow-md transition-shadow duration-200 bg-card border-border w-full">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={profileMap[thread.user_id]?.avatarUrl || '/placeholder-avatar.jpg'} 
                  alt={profileMap[thread.user_id]?.name || 'Author'} 
                />
                <AvatarFallback>
                  {profileMap[thread.user_id]?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/profile/${thread.user_id}`} className="font-semibold hover:underline">
                  {profileMap[thread.user_id]?.name || 'Anonymous'}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formattedDate}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Link to={`/thread/${thread.id}`} className="block mb-3">
                  <h3 className="text-xl font-playfair font-semibold mb-2 hover:text-primary transition-colors">{thread.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {thread.snippet || (thread.segments?.[0]?.content ? 
                      stripVisibleTags(thread.segments[0].content).substring(0, 160)
                      : '')}
                  </p>
                </Link>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {thread.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {thread.cover_image && (
                <div className="hidden sm:block rounded-md overflow-hidden w-48 h-32 flex-shrink-0">
                  <img 
                    src={thread.cover_image} 
                    alt={thread.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">❤️</span>
                  <span className="text-xs text-muted-foreground">
                    {reactionTotal}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔄</span>
                  <span className="text-xs text-muted-foreground">{thread.fork_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📑</span>
                  <span className="text-xs text-muted-foreground">{thread.segments?.length || 0} segments</span>
                </div>
              </div>
              <Link to={`/thread/${thread.id}`} className="text-sm text-primary hover:underline">
                Read more
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RelatedThreads;
