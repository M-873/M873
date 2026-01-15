import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const LearnMore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">M873</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              About M873
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn more about our mission and vision
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Mission Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">
                Our Mission
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p>
                  M873 is built with a clear mission: to make Artificial Intelligence simple, accessible, and free for everyone—especially students, beginners, and independent learners.
                </p>
                <p>
                  At M873, you will find a growing collection of easy-to-use, cost-free AI tools designed to help you learn, practice, and build real-world solutions without financial barriers. All tools available on this platform are created and maintained by M873, ensuring simplicity, reliability, and educational value.
                </p>
              </div>
            </section>

            {/* What You Can Do Section */}
            <section className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">
                What You Can Do with M873
              </h2>
              
              <div className="grid gap-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-primary">
                    Learn AI the Easy Way
                  </h3>
                  <p className="text-muted-foreground">
                    M873 removes complexity from AI learning. You can understand core AI concepts, train models, and explore practical use cases without advanced technical knowledge.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-primary">
                    Train AI Using Free Tools
                  </h3>
                  <p className="text-muted-foreground">
                    The platform provides free tools that allow users to train AI models, experiment with data, and understand how AI works in real scenarios—without paid software or subscriptions.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-primary">
                    Student-Focused Utilities
                  </h3>
                  <p className="text-muted-foreground">
                    M873 offers helpful tools for students to support:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Academic studies</li>
                    <li>Daily productivity</li>
                    <li>Hostel and shared-living management</li>
                  </ul>
                  <p className="text-muted-foreground">
                    These tools are designed to make student life more organized, efficient, and stress-free.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-primary">
                    Practical AI Usage
                  </h3>
                  <p className="text-muted-foreground">
                    Learn how to use AI effectively—not just theoretically. M873 focuses on real-world AI applications, helping users understand how AI can improve learning, decision-making, and daily tasks.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-primary">
                    Future-Ready Platform
                  </h3>
                  <p className="text-muted-foreground">
                    M873 is continuously evolving. Upcoming tools and features are being developed to make the platform more:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Advanced</li>
                    <li>Sustainable</li>
                    <li>Beneficial for long-term learning and innovation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Vision Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">
                Our Vision
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p>
                  The goal of M873 is to provide the lowest-cost AI learning experience—free whenever possible—while maintaining quality, usability, and future growth. We aim to build a healthy, profitable, and advanced ecosystem that empowers learners and creators to grow with AI.
                </p>
                <p>
                  M873 is not just a platform. It is a new era of intelligent learning, built for the future.
                </p>
              </div>
            </section>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-8">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg" 
              onClick={() => navigate('/dashboard')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </main>

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
    </div>
  );
};

export default LearnMore;