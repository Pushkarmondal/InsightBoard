const Login = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-auth-gradient-start to-auth-gradient-end flex items-center justify-center p-4">
        <div className="w-full max-w-md relative">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent text-sm">
                Sign in to your account
              </p>
            </div>
            <form className="space-y-6">
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
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 bg-secondary border border-secondary rounded-lg text-secondary-foreground placeholder-muted-foreground focus:bg-secondary/80 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer h-12 bg-primary/90 hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
              >
                Sign In
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-center text-sm bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent">
                Don&apos;t have an account?{" "}
                <a
                  href="/auth/signup"
                  className="underline cursor-pointer font-semibold"
                >
                  Create one
                </a>
              </p>
            </div>
          </div>
  
          <div className="mt-6 text-center">
            <p className="text-xs bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent opacity-60">
              Protected by industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    );
  };
  
export default Login;
  