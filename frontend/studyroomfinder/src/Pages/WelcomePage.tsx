import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/welcomepage/FeatureCard";
import { BookOpen, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
const WelcomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to StudyBuddy
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Your ultimate companion for productive studying. Find spots, track sessions, create groups, and
                  connect with study buddies.
                </p>
              </div>
              <div className="space-x-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Our Features
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<MapPin className="h-10 w-10 mb-4 text-primary" />}
                title="Find Study Spots"
                description="Discover the perfect study environments near you."
              />
              <FeatureCard
                icon={<Clock className="h-10 w-10 mb-4 text-primary" />}
                title="Track Study Sessions"
                description="Monitor your progress and boost productivity."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 mb-4 text-primary" />}
                title="Create Study Groups"
                description="Collaborate with peers on shared subjects."
              />
              <FeatureCard
                icon={<BookOpen className="h-10 w-10 mb-4 text-primary" />}
                title="Find Study Buddies"
                description="Connect with like-minded learners in your area."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WelcomePage;
