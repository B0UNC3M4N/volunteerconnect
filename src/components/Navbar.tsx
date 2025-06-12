
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const { user, loading, signOut, isNonprofit, isVolunteer, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: error.message,
      });
    }
  };

  const getDashboardLink = () => {
    console.log("Getting dashboard link. Is nonprofit:", isNonprofit(), "Is volunteer:", isVolunteer(), "Is admin:", isAdmin());
    if (isAdmin()) {
      return "/admin-dashboard";
    } else if (isNonprofit()) {
      return "/nonprofit-dashboard";
    } else if (isVolunteer()) {
      return "/volunteer-dashboard";
    }
    return "/opportunities"; // Fallback if role is not recognized
  };

  const renderDashboardLink = () => {
    if (!user || loading) return null;

    console.log("Rendering dashboard link. User role:", userRole);
    
    // Only show dashboard link if user role is recognized
    if (isNonprofit() || isVolunteer() || isAdmin()) {
      return (
        <Link to={getDashboardLink()} className="text-base hover:text-volunteer-600 transition-colors">
          Dashboard
        </Link>
      );
    }

    return null;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-volunteer-600 text-white p-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-volunteer-700 to-nonprofit-600 bg-clip-text text-transparent">VolunteerHub</span>
        </Link>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-base hover:text-volunteer-600 transition-colors">Home</Link>
                <Link to="/opportunities" className="text-base hover:text-volunteer-600 transition-colors">Opportunities</Link>
                <Link to="/about" className="text-base hover:text-volunteer-600 transition-colors">About</Link>
                <Link to="/contact" className="text-base hover:text-volunteer-600 transition-colors">Contact</Link>
                {!loading && user ? (
                  <>
                    {isNonprofit() && (
                      <Link to="/post-opportunity" className="text-base hover:text-volunteer-600 transition-colors">Post Opportunity</Link>
                    )}
                    {isAdmin() && (
                      <Link to="/admin-dashboard" className="text-base hover:text-volunteer-600 transition-colors">Admin Dashboard</Link>
                    )}
                    {renderDashboardLink()}
                    <div className="text-sm text-gray-500 mb-2">
                      Logged in as: {userRole || 'User'}
                    </div>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                  </>
                ) : !loading ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button asChild variant="outline">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="bg-volunteer-600 text-white hover:bg-volunteer-700">
                      <Link to="/register">Register</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-1 text-sm">Loading...</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="text-base hover:text-volunteer-600 transition-colors">Home</Link>
          <Link to="/opportunities" className="text-base hover:text-volunteer-600 transition-colors">Opportunities</Link>
          <Link to="/about" className="text-base hover:text-volunteer-600 transition-colors">About</Link>
          <Link to="/contact" className="text-base hover:text-volunteer-600 transition-colors">Contact</Link>
          
          {!loading && user ? (
            <>
              {isNonprofit() && (
                <Link to="/post-opportunity" className="text-base hover:text-volunteer-600 transition-colors">Post Opportunity</Link>
              )}
              {isAdmin() && (
                <Link to="/admin-dashboard" className="text-base hover:text-volunteer-600 transition-colors">Admin Dashboard</Link>
              )}
              {renderDashboardLink()}
              <div className="text-sm text-gray-500">
                {userRole || 'User'}
              </div>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : !loading ? (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-volunteer-600 text-white hover:bg-volunteer-700">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          ) : (
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
