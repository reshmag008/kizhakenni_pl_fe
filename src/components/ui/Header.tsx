import { useState,useEffect } from 'react';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import { Trophy, Users, UserPlus, Menu, X , Home,Group,LogIn,LogOut,Radio} from 'lucide-react';
import { Button } from '@/components/ui/button';
import bklogo from '../../assets/bk_logo.jpeg'
import { useAuth } from "../../context/AuthContext"; // adjust the path


const Header = () => {
  const location = useLocation();
      const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false)

  const navItems = [
    // isLoggedIn
    // ? { path: "/login", label: "Logout", icon: LogOut }
    // : { path: "/login", label: "Login", icon: LogIn },
    { path: '/', label: 'Home', icon: Home },
    { path: '/players', label: 'Players', icon: Users },
    { path: '/register', label: 'Register', icon: UserPlus },
    { path: '/teams', label: 'Teams', icon: Group },
    // { path: '/auction-live', label: 'Live', icon: Radio },
  ];

  useEffect(()=>{
    console.log("inside header useeffect== ", isLoggedIn)
  },[isLoggedIn])


  return (
    <header className="gradient-hero text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="p-1.5 sm:p-2 ">
              {/* <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" /> */}
              <img
          src={bklogo}   // replace with your image path or URL
          alt="Poster"
          className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground object-cover"
        />
            </div>



            <div>



              <div className="flex items-center gap-2">

    <h1 className="font-heading font-bold text-lg sm:text-xl tracking-tight">
      BK's Cricket Auction
    </h1>

   {/* <Link
      to="/auction-live"
      className="
        flex items-center gap-1
        rounded-full
        border border-red-400/40
        bg-red-500/15
        px-2 py-0.5
        text-[9px] sm:text-[10px]
        font-bold uppercase tracking-wide
        text-red-400
        hover:bg-red-500/25
        hover:border-red-400/70
        transition-all
        cursor-pointer
        no-underline
      "
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      LIVE
    </Link> */}

  </div>


            </div>




          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="sm:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
