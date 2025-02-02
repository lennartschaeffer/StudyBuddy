import { useState } from "react";
// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
import { useAuth } from "../Context/useAuth";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const RegistrationPage = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [email, setEmail] = useState("");
  const { registerUser } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!username || !password || !firstName || !lastName || !email) {
      toast({
        title: "Error.",
        description: "Please fill in all required fields.",
      })
      return;
    }
    registerUser(username, password, firstName, lastName, email, university, degree);
  };
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" to="/">
          <BookOpen className="h-6 w-6 mr-2" />
          <span className="font-bold">StudyBuddy</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Join StudyBuddy to start your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleRegister(e)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="firstName">First Name*</Label>
                  <Input id="firstName" name="firstName" onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="lastName">Last Name*</Label>
                  <Input id="lastName" name="lastName"  onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email*</Label>
                  <Input id="email" name="email" type="email"  onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username*</Label>
                  <Input id="username" name="username" 
                   onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password (Minimum of 6 characters)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="university">University (Optional)</Label>
                  <Input id="university" name="university"  onChange={(e) => setUniversity(e.target.value)} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="degree">Degree (Optional)</Label>
                  <Input id="degree" name="degree" onChange={(e) => setDegree(e.target.value)} />
                </div>
              </div>
              <Button className="w-full mt-6" type="submit">
                Register
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 StudyBuddy. All rights reserved.</p>
      </footer>
      <Toaster />
    </div>
  );
};

export default RegistrationPage;
