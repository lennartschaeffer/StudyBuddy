import { LoginForm } from "@/components/login/LoginForm";
import { Toaster } from "@/components/ui/toaster";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-14 flex items-center">
          <Link className="flex items-center justify-center" to="/">
            <BookOpen className="h-6 w-6 mr-2" />
            <span className="font-bold">StudyBuddy</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginForm />
          <Toaster />
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 StudyBuddy. All rights reserved.
          </p>
        </footer>
      </div>
  );
};

export default LoginPage;
