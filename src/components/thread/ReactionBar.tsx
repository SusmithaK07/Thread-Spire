import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ReactionType, reactionService } from '@/lib/services/reaction.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReactionBarProps {
  threadId: string;
  segmentId?: string;
}

interface ReactionProfile {
  name?: string;
}

interface ReactionWithProfile {
  user_id: string;
  profiles?: ReactionProfile;
}

const ReactionBar = ({ threadId, segmentId }: ReactionBarProps) => {
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const reactionEmojis: ReactionType[] = ['🤯', '💡', '😌', '🔥', '🫶'];
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    '🤯': 0,
    '💡': 0,
    '😌': 0,
    '🔥': 0,
    '🫶': 0
  });
  const [totalReactions, setTotalReactions] = useState(0);
  const [recentReactors, setRecentReactors] = useState<string[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!threadId) return;
    
    // Load initial reaction counts
    const loadReactions = async () => {
      try {
        const counts = await reactionService.getReactionCounts(threadId, segmentId);
        setReactionCounts(counts);
        
        // Calculate total
        let total = 0;
        for (const key in counts) {
          total += counts[key];
        }
        setTotalReactions(total);
        
        // Get recent reactors (up to 3)
        let query = supabase
          .from('reactions')
          .select(`user_id, profiles:user_id(name)`)
          .eq('thread_id', threadId);
        if (segmentId) query = query.eq('segment_id', segmentId);
        const { data: recentReactionsData } = await query
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentReactionsData && recentReactionsData.length > 0) {
          const names = recentReactionsData.map((reaction: ReactionWithProfile) => {
            if (reaction && reaction.profiles && reaction.profiles.name) {
              return reaction.profiles.name;
            }
            return 'Anonymous User';
          });
          setRecentReactors(names);
        }
        
        if (isAuthenticated) {
          const userReactions = await reactionService.getUserReactions(threadId, segmentId);
          setUserReactions(userReactions);
        }
      } catch (error) {
        console.error('Error loading reactions:', error);
      }
    };
    
    loadReactions();
    
    // Subscribe to reaction changes
    const subscription = reactionService.subscribeToReactions(threadId, segmentId, (reactions) => {
      const newCounts = { ...reactionCounts };
      reactions.forEach(r => {
        newCounts[r.type] = r.count;
      });
      setReactionCounts(newCounts);
      
      // Calculate total
      let total = 0;
      for (const r of reactions) {
        total += r.count;
      }
      setTotalReactions(total);
      
      // Refresh recent reactors on changes
      const refreshRecentReactors = async () => {
        let query = supabase
          .from('reactions')
          .select(`user_id, profiles:user_id(name)`)
          .eq('thread_id', threadId);
        if (segmentId) query = query.eq('segment_id', segmentId);
        const { data: recentReactionsData } = await query
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentReactionsData && recentReactionsData.length > 0) {
          const names = recentReactionsData.map((reaction: ReactionWithProfile) => {
            if (reaction && reaction.profiles && reaction.profiles.name) {
              return reaction.profiles.name;
            }
            return 'Anonymous User';
          });
          setRecentReactors(names);
        }
      };
      
      refreshRecentReactors();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [threadId, segmentId, isAuthenticated]);
  
  const handleReaction = async (type: ReactionType) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to threads",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userReactions.includes(type)) {
        // Remove reaction (toggle off)
        await reactionService.removeReaction(threadId, type, segmentId);
      } else {
        // Remove any existing reaction first (if any)
        if (userReactions.length > 0) {
          await reactionService.removeReaction(threadId, userReactions[0], segmentId);
        }
        // Add new reaction
        await reactionService.addReaction(threadId, type, segmentId);
      }
      // Always fetch the latest counts and user reactions after any change
      const counts = await reactionService.getReactionCounts(threadId, segmentId);
      setReactionCounts(counts);
      
      // Calculate total
      let total = 0;
      for (const key in counts) {
        total += counts[key];
      }
      setTotalReactions(total);
      
      const updatedUserReactions = await reactionService.getUserReactions(threadId, segmentId);
      setUserReactions(updatedUserReactions);
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };
  
  // Display reaction summary if there are reactions
  if (totalReactions > 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 group">
          <div className="flex">
            {Object.entries(reactionCounts)
              .filter(([_, count]) => count > 0)
              .slice(0, 3)
              .map(([type, _]) => (
                <span key={type} className="inline-block -ml-1 first:ml-0">
                  {type}
                </span>
              ))}
          </div>
          
          <span className="text-sm text-muted-foreground group-hover:underline cursor-pointer">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        </div>
        
        {recentReactors.length > 0 && (
          <div className="text-xs text-muted-foreground hidden md:block">
            {recentReactors.length === 1 
              ? `${recentReactors[0]} reacted` 
              : recentReactors.length === 2 
                ? `${recentReactors[0]} and ${recentReactors[1]} reacted`
                : `${recentReactors[0]}, ${recentReactors[1]}, and ${totalReactions - 2} others reacted`
            }
          </div>
        )}
        
        {isAuthenticated && (
          <div>
            {reactionEmojis.map((type) => {
              const isSelected = userReactions.includes(type);
              return (
                <Button 
                  key={type}
                  variant="ghost" 
                  size="sm"
                  className={`px-2 rounded-full transition-all duration-150 ${isSelected ? 'bg-yellow-200 border-2 border-yellow-500 font-bold text-yellow-900 shadow-sm' : ''}`}
                  onClick={() => handleReaction(type)}
                  aria-pressed={isSelected}
                >
                  <span>{type}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  
  // Default reaction buttons when no reactions yet
  // Only show to authenticated users
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      {reactionEmojis.map((type) => {
        const isSelected = userReactions.includes(type);
        return (
          <Button 
            key={type}
            variant="ghost" 
            size="sm"
            className={`px-2 transition-all duration-150 ${isSelected ? 'bg-yellow-200 border-2 border-yellow-500 font-bold text-yellow-900 shadow-sm' : ''}`}
            onClick={() => handleReaction(type)}
            aria-pressed={isSelected}
          >
            <span className="mr-1">{type}</span>
            <span className="text-xs">{reactionCounts[type]}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
