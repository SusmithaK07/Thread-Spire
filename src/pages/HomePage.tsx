import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, PenLine, Loader2, Smile } from 'lucide-react';
import { threadService } from '@/lib/services/thread.service';
import { analyticsService } from '@/lib/services/analytics.service';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ThreadCard from '@/components/discovery/ThreadCard';
import { cn } from '@/lib/utils';
import { removeSurroundingHtmlTags, processHtmlForRendering, removeDisplayedHtmlTags, stripVisibleTags } from '@/lib/utils/html-utils';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [featuredThreads, setFeaturedThreads] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string } | null>(null);
  const [profileMap, setProfileMap] = useState<Record<string, { name: string; avatarUrl: string }>>({});
  const [cursorVisible, setCursorVisible] = useState(true);
  const [typedText, setTypedText] = useState('');
  const placeholderText = 'Create a thread...';

  // If not authenticated, redirect to the landing page (Index)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Typing animation effect
  useEffect(() => {
    // Set up blinking cursor
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    // Set up typing animation
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < placeholderText.length) {
        setTypedText(placeholderText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => {
      clearInterval(cursorInterval);
      clearInterval(typingInterval);
    };
  }, []);

  // Load user profile for avatar display
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  // Load featured threads
  useEffect(() => {
    loadFeaturedThreads();
  }, []);

  // Fetch profiles for all user_ids in results whenever featured threads change
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = Array.from(new Set(featuredThreads.map(t => t.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        const map: Record<string, { name: string; avatarUrl: string }> = {};
        profiles?.forEach((p: any) => {
          map[p.id] = { name: p.name || 'Anonymous', avatarUrl: p.avatar_url || '/placeholder-avatar.jpg' };
        });
        setProfileMap(map);
      } else {
        setProfileMap({});
      }
    };
    if (featuredThreads.length > 0) fetchProfiles();
  }, [featuredThreads]);

  const loadFeaturedThreads = async () => {
    try {
      setFeaturedLoading(true);
      
      // Get threads with high engagement
      const { threads } = await threadService.getThreads({
        limit: 20, // Get more threads to calculate from
        sortBy: 'created_at',
        sortOrder: 'desc',
        onlyPublished: true
      });
      
      // Filter out private threads
      const publicThreads = threads.filter(thread => thread.is_private === false);
      
      // Calculate engagement score for each thread
      const threadsWithEngagement = publicThreads.map(thread => {
        // Calculate engagement score based on reactions and forks
        const reactionCount = Object.values(thread.reaction_counts || {}).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0);
        const forkCount = Number(thread.fork_count || 0);
        const bookmarkCount = Number(thread.bookmarks || 0);
        
        // Weighted score: reactions (1x), forks (3x), bookmarks (2x)
        const engagementScore = Number(reactionCount) + (forkCount * 3) + (bookmarkCount * 2);
        
        return {
          ...thread,
          engagementScore
        };
      });
      
      // Sort by engagement score and take top featured threads
      const topFeatured = threadsWithEngagement
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 5);
      
      setFeaturedThreads(topFeatured);
    } catch (error) {
      console.error('Error loading featured threads:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  // Get display name for welcome message
  const displayName = userProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';

  // Update the content display to use the new function
  const processContent = (content: string) => {
    if (!content) return '';
    
    // First directly handle the literal "<p>" and "</p>" strings that might appear
    const cleanedContent = content
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/&lt;p&gt;/g, '')
      .replace(/&lt;\/p&gt;/g, '');
    
    // Then use the utility functions for any other cases
    return removeDisplayedHtmlTags(removeSurroundingHtmlTags(cleanedContent)).substring(0, 160);
  };

  return (
    <Layout fullWidth>
      <div className="max-w-6xl mx-auto w-full px-2">
        {/* Welcome message for authenticated users */}
        <div className="mb-6">
          <h1 className="text-3xl font-playfair font-semibold mb-2 text-left flex items-center gap-2">
            Welcome back{displayName ? `, ${displayName}` : ''}! <Smile className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-muted-foreground text-left">
            Share your knowledge, discover new threads, and connect with the community.
          </p>
        </div>

        {/* Create a thread card for authenticated users */}
        <Card className="mb-6 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-card border-border w-full">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage 
                src={userProfile?.avatar_url || '/placeholder-avatar.jpg'} 
                alt={userProfile?.name || 'Your profile'} 
              />
              <AvatarFallback>
                {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div 
              className="flex-1 rounded-full border border-input bg-card px-6 py-3 text-muted-foreground/60 hover:bg-accent/10 hover:border-muted-foreground/50 cursor-pointer transition-colors duration-200"
              onClick={() => navigate('/create')}
            >
              <span className="text-sm md:text-base">
                {typedText}
                <span className={cn("ml-[1px] border-l-2 border-primary h-[1.2em] inline-block", 
                  cursorVisible ? "opacity-100" : "opacity-0"
                )} style={{ width: '2px', marginLeft: '1px', verticalAlign: 'middle' }}></span>
              </span>
            </div>
          </div>
        </Card>
        
        {/* Featured Threads */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-playfair font-semibold text-left">Featured Threads</h2>
          </div>
          
          {featuredLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : featuredThreads.length > 0 ? (
            <div className="flex flex-col gap-4">
              {featuredThreads.map(thread => (
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
                        {new Date(thread.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
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
                          {String(Object.values(thread.reaction_counts || {}).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0))}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground">No featured threads found</p>
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="mt-8 mb-12">
          <Card className="p-6 bg-primary/5 border border-primary/20 w-full">
            <h2 className="text-xl font-semibold mb-3">Discover More Threads</h2>
            <p className="text-muted-foreground mb-4">
              Explore our curated collection of threads on various topics. Find what interests you and dive deeper.
            </p>
            <Button onClick={() => navigate('/explore')}>
              <PenLine className="h-4 w-4 mr-2" />
              Explore Threads
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 