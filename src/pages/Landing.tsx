import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, Zap, Mail, Phone, Facebook, Github, Instagram, MessageCircle, Linkedin, User } from "lucide-react";
import Logo from "@/components/Logo";
import ownerAvatar from "@/assets/owner-avatar.jfif";
import ChatBot from "@/components/ChatBot";

const Landing = () => {
  const navigate = useNavigate();
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between bg-secondary-foreground">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">M873</span>
          </div>
          <div className="flex gap-3">
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <p className="text-sm md:text-base font-medium tracking-wider uppercase text-black">
              Welcome to M873
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">M873 SIMPLE AI SOLUTIONS</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              M873 is an easy AI platform for learning and building projects. You can explore AI, practice development, and create smart solutions with simple tools.
            </p>

          </div>

          <div className="flex gap-4 justify-center pt-6 flex-wrap">
            <Button size="lg" className="px-8 py-6 text-lg" onClick={() => navigate('/dashboard')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" onClick={() => navigate('/learn-more')}>
              Learn More
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8 py-6 text-lg gap-2" 
              onClick={() => setShowOwnerDialog(true)}
            >
              <User className="w-5 h-5" />
              About the Owner
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
            <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Modern Design</h3>
                <p className="text-sm text-muted-foreground">
                  Clean and intuitive interface
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  Protected dashboard features
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary">Future Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Upcoming features in development
                </p>
              </CardContent>
            </Card>


          </div>
        </div>
      </main>

      {/* Owner Dialog */}
      <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">About the Owner</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 pt-4">
            <img 
              src={ownerAvatar} 
              alt="Md. Mahfuzul Islam" 
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20" 
            />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground">Md. Mahfuzul Islam</h3>
              <p className="text-muted-foreground">Founder, M873</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Logo className="w-8 h-8" />
              <a href="tel:+8801710400751" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="Phone">
                <Phone className="w-6 h-6" />
              </a>
              <a href="mailto:mahfuzulislam873@gmail.com" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="Email">
                <Mail className="w-6 h-6" />
              </a>
              <a href="https://www.facebook.com/share/17RTaPnUfC/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://github.com/mahfuzul873" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="GitHub">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/mahfuzul873?igsh=MXI5dXh4ajJlbG5uYw==" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://wa.me/qr/LQDBPILEL6ZHG1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="WhatsApp">
                <MessageCircle className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/mahfuzul873" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125" aria-label="LinkedIn">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="w-6 h-6" />
            <span className="text-sm text-muted-foreground">M873</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} M873. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Hidden Owner Access Dot */}
      <button 
        onClick={() => navigate('/owner/login')} 
        className="fixed bottom-4 right-4 w-2 h-2 bg-black rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer z-50"
        aria-label="Owner Access"
      />

      {/* ChatBot */}
      <ChatBot />
    </div>;
};
export default Landing;
