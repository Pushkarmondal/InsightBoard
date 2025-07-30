"use client"
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
const Signup = () => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post("http://localhost:3333/api/auth/signup", {
            firstName,
            lastName,
            email,
            password,
        })
        .then(() => {
            router.push("/auth/login");
        })
        .catch((error) => {
            console.log(error);
        });
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-auth-gradient-start to-auth-gradient-end flex items-center justify-center p-4">
        <div className="w-full max-w-md relative">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-sm bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent">
                Join us and get started today
              </p>
            </div>
  
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-12 px-4 bg-secondary border border-secondary rounded-lg text-secondary-foreground placeholder-muted-foreground focus:bg-secondary/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 px-4 bg-secondary border border-secondary rounded-lg text-secondary-foreground placeholder-muted-foreground focus:bg-secondary/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
                  />
                </div>
              </div>
  
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-secondary border border-secondary rounded-lg text-secondary-foreground placeholder-muted-foreground focus:bg-secondary/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
                />
              </div>
  
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-secondary border border-secondary rounded-lg text-secondary-foreground placeholder-muted-foreground focus:bg-secondary/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
                />
              </div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full cursor-pointer h-12 bg-primary/90 hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                Create Account
              </button>
            </form>
  
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-center text-sm bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent">
                Already have an account?{" "}
                <a href="/auth/login" className="underline cursor-pointer font-semibold">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
export default Signup;
  