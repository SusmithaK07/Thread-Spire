import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useScrollAnimations } from '@/lib/animations';

// Import the animations CSS
import '@/styles/animations.css';

const AnimationsDemo = () => {
  // Initialize scroll animations
  useEffect(() => {
    const cleanup = useScrollAnimations();
    return cleanup;
  }, []);

  // State for demo interactions
  const [fadeVisible, setFadeVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('fade');

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Animation Showcase</h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive set of animations for enhancing user experience
        </p>
      </div>

      <Tabs defaultValue="fade" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-8">
          <TabsTrigger value="fade">Fade</TabsTrigger>
          <TabsTrigger value="slide">Slide/Scale</TabsTrigger>
          <TabsTrigger value="hover">Hover</TabsTrigger>
          <TabsTrigger value="micro">Micro</TabsTrigger>
          <TabsTrigger value="page">Page</TabsTrigger>
          <TabsTrigger value="parallax">Parallax</TabsTrigger>
          <TabsTrigger value="scroll">Scroll</TabsTrigger>
        </TabsList>

        {/* 1. FADE ANIMATIONS */}
        <TabsContent value="fade" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Fade Animations</CardTitle>
              <CardDescription>
                Smooth fade in/out animations for loading elements and transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 items-center">
                <Button onClick={() => setFadeVisible(!fadeVisible)}>
                  {fadeVisible ? 'Hide Element' : 'Show Element'}
                </Button>

                <div className="h-40 w-full flex items-center justify-center">
                  {fadeVisible && (
                    <Card className="w-64 fade-in">
                      <CardContent className="p-4">
                        <p>This element fades in and out</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="fade-in-up">
                  <CardContent className="p-4 text-center">
                    <p>Fade Up</p>
                  </CardContent>
                </Card>
                <Card className="fade-in-down">
                  <CardContent className="p-4 text-center">
                    <p>Fade Down</p>
                  </CardContent>
                </Card>
                <Card className="fade-in-left">
                  <CardContent className="p-4 text-center">
                    <p>Fade Left</p>
                  </CardContent>
                </Card>
                <Card className="fade-in-right">
                  <CardContent className="p-4 text-center">
                    <p>Fade Right</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. SLIDE/SCALE ANIMATIONS */}
        <TabsContent value="slide" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>2. Slide & Scale Animations</CardTitle>
              <CardDescription>
                Smooth transitions for modals, drawers, and image galleries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 items-center">
                <Button onClick={() => setModalVisible(!modalVisible)}>
                  {modalVisible ? 'Close Modal' : 'Open Modal'}
                </Button>

                {modalVisible && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalVisible(false)}>
                    <Card className="w-[400px] modal-enter" onClick={(e) => e.stopPropagation()}>
                      <CardHeader>
                        <CardTitle>Modal with Animation</CardTitle>
                        <CardDescription>This modal uses a combined scale and slide animation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Modal content goes here. Click outside to close.</p>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button variant="outline" onClick={() => setModalVisible(false)}>Close</Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="slide-up">
                  <CardContent className="p-4 text-center">
                    <p>Slide Up</p>
                  </CardContent>
                </Card>
                <Card className="slide-down">
                  <CardContent className="p-4 text-center">
                    <p>Slide Down</p>
                  </CardContent>
                </Card>
                <Card className="slide-left">
                  <CardContent className="p-4 text-center">
                    <p>Slide Left</p>
                  </CardContent>
                </Card>
                <Card className="slide-right">
                  <CardContent className="p-4 text-center">
                    <p>Slide Right</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="scale-in">
                  <CardContent className="p-4 text-center">
                    <p>Scale In</p>
                  </CardContent>
                </Card>
                <Card className="scale-in" style={{ animationDelay: '0.2s' }}>
                  <CardContent className="p-4 text-center">
                    <p>Scale In (Delayed)</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. HOVER ANIMATIONS */}
        <TabsContent value="hover" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>3. Hover Effect Animations</CardTitle>
              <CardDescription>
                Interactive hover effects for buttons, cards, and links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="scale-hover">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Scale Hover</h3>
                    <p className="text-sm text-muted-foreground">Hover over this card to see it scale up slightly</p>
                  </CardContent>
                </Card>

                <Card className="elevate-hover">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Elevation Hover</h3>
                    <p className="text-sm text-muted-foreground">Hover to see it lift up with a shadow</p>
                  </CardContent>
                </Card>

                <Card className="border-hover">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Border Hover</h3>
                    <p className="text-sm text-muted-foreground">Hover to see the border color change</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="glow-hover">Glow Effect</Button>
                <Button variant="outline" className="bg-fill-hover">Fill Effect</Button>
                <a href="#" className="underline-hover text-primary px-4 py-2">Underline Animation</a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MICRO-INTERACTIONS */}
        <TabsContent value="micro" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>4. Micro-Interaction Animations</CardTitle>
              <CardDescription>
                Subtle animations for form elements and interactive components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="name">Input with Focus Animation</Label>
                  <Input id="name" placeholder="Type here..." className="input-focus" />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="toggle">Toggle Switch Animation</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="toggle" className="toggle-switch" />
                    <Label htmlFor="toggle">Toggle me</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Checkbox Animation</Label>
                  <div className="flex items-center space-x-2 checkbox-animation">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Button Press Effect</Label>
                  <Button className="button-press">Click Me</Button>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <div className="h-8 w-8 bg-primary rounded-full mx-auto pulse"></div>
                  <p className="mt-2 text-sm">Pulse</p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 bg-primary rounded-full mx-auto spin"></div>
                  <p className="mt-2 text-sm">Spin</p>
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 bg-primary rounded-full mx-auto bounce"></div>
                  <p className="mt-2 text-sm">Bounce</p>
                </div>
                <div className="text-center">
                  <div className="relative h-8 w-8 mx-auto">
                    <div className="absolute inset-0 bg-primary/30 rounded-full ping"></div>
                    <div className="absolute inset-0 bg-primary rounded-full"></div>
                  </div>
                  <p className="mt-2 text-sm">Ping</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. PAGE TRANSITIONS */}
        <TabsContent value="page" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>5. Page Transition Animations</CardTitle>
              <CardDescription>
                Smooth transitions between pages in single-page applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => {
                  const content = document.getElementById('page-transition-demo');
                  if (content) {
                    content.className = 'p-6 bg-card page-transition-fade';
                    setTimeout(() => {
                      content.textContent = 'Page content after fade transition';
                    }, 200);
                  }
                }}>Fade Transition</Button>
                
                <Button onClick={() => {
                  const content = document.getElementById('page-transition-demo');
                  if (content) {
                    content.className = 'p-6 bg-card page-transition-slide';
                    setTimeout(() => {
                      content.textContent = 'Page content after slide transition';
                    }, 200);
                  }
                }}>Slide Transition</Button>
                
                <Button onClick={() => {
                  const content = document.getElementById('page-transition-demo');
                  if (content) {
                    content.className = 'p-6 bg-card page-transition-scale';
                    setTimeout(() => {
                      content.textContent = 'Page content after scale transition';
                    }, 200);
                  }
                }}>Scale Transition</Button>
              </div>

              <div className="mt-8 border rounded-lg overflow-hidden">
                <div className="bg-muted p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="ml-4 text-sm font-medium">Page Transition Demo</div>
                  </div>
                </div>
                <div id="page-transition-demo" className="p-6 bg-card">
                  Click a transition button above to see it in action
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. PARALLAX SCROLLING */}
        <TabsContent value="parallax" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>6. Parallax Scrolling Effects</CardTitle>
              <CardDescription>
                Create depth with elements that move at different speeds during scrolling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="parallax-container h-64 rounded-lg overflow-hidden">
                <div 
                  className="parallax-bg" 
                  data-parallax 
                  data-parallax-speed="0.2"
                  data-parallax-direction="up"
                  style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)'
                  }}
                ></div>
                <div className="relative flex items-center justify-center h-full">
                  <div className="text-white text-center p-6 bg-black/30 rounded-lg backdrop-blur-sm">
                    <h3 className="text-2xl font-bold mb-2">Parallax Effect</h3>
                    <p>Scroll down to see the background move at a different speed</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Parallax scrolling creates an illusion of depth by moving background elements slower than foreground elements.
                  This example uses the data-parallax attributes and JavaScript to create the effect.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. SCROLL-TRIGGERED ANIMATIONS */}
        <TabsContent value="scroll" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>7. Scroll-Triggered Animations</CardTitle>
              <CardDescription>
                Elements that animate when they enter the viewport during scrolling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                <p className="text-center text-muted-foreground">
                  Scroll down to see elements animate as they enter the viewport
                </p>

                <div 
                  className="p-6 bg-card rounded-lg"
                  data-animate-on-scroll
                  data-animation="fadeIn"
                >
                  <h3 className="text-xl font-medium mb-2">Fade In on Scroll</h3>
                  <p>This element fades in when it enters the viewport</p>
                </div>

                <div 
                  className="p-6 bg-card rounded-lg"
                  data-animate-on-scroll
                  data-animation="fadeInUp"
                >
                  <h3 className="text-xl font-medium mb-2">Fade Up on Scroll</h3>
                  <p>This element slides up and fades in when it enters the viewport</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-6 bg-card rounded-lg"
                    data-animate-on-scroll
                    data-animation="fadeInLeft"
                    data-animation-delay="0"
                  >
                    <h3 className="text-lg font-medium mb-2">Item 1</h3>
                    <p>Animates from left</p>
                  </div>
                  <div 
                    className="p-6 bg-card rounded-lg"
                    data-animate-on-scroll
                    data-animation="fadeInUp"
                    data-animation-delay="200"
                  >
                    <h3 className="text-lg font-medium mb-2">Item 2</h3>
                    <p>Animates from bottom with delay</p>
                  </div>
                  <div 
                    className="p-6 bg-card rounded-lg"
                    data-animate-on-scroll
                    data-animation="fadeInRight"
                    data-animation-delay="400"
                  >
                    <h3 className="text-lg font-medium mb-2">Item 3</h3>
                    <p>Animates from right</p>
                  </div>
                </div>

                <div 
                  className="p-6 bg-card rounded-lg"
                  data-animate-on-scroll
                  data-animation="scaleIn"
                >
                  <h3 className="text-xl font-medium mb-2">Scale In on Scroll</h3>
                  <p>This element scales in when it enters the viewport</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-medium">Staggered List Animation</h3>
                  <ul className="space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <li 
                        key={item}
                        className="p-4 bg-card rounded-lg stagger-item"
                        data-animate-on-scroll
                        data-animation="fadeInUp"
                        data-animation-delay={item * 100}
                      >
                        List item {item} - with staggered animation delay
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimationsDemo;
