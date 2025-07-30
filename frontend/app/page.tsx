const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-auth-gradient-start to-auth-gradient-end flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent">Welcome to Auth Pages</h1>
        <p className="text-xl text-muted-foreground mb-8 bg-gradient-to-r from-foreground to-auth-accent bg-clip-text text-transparent">Choose your authentication option</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="/auth/login" 
            className="px-8 py-4 bg-gradient-to-r from-auth-gradient-start to-auth-gradient-end hover:from-auth-gradient-start hover:to-auth-gradient-end text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Login
          </a>
          <a 
            href="/auth/signup" 
            className="px-8 py-4 bg-gradient-to-r from-auth-gradient-start to-auth-gradient-end hover:from-auth-gradient-start hover:to-auth-gradient-end text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;