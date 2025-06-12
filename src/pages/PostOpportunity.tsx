
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OpportunityForm } from '@/components/OpportunityForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PostOpportunity() {
  const { user, loading, isNonprofit } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto mt-12">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="mb-4">You need to be signed in to post volunteer opportunities.</p>
            <Button asChild className="bg-nonprofit-600 hover:bg-nonprofit-700 text-white">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Restrict access to nonprofit users only
  if (!loading && !isNonprofit()) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mt-12">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                Only nonprofit organizations can post volunteer opportunities. If you represent a nonprofit organization, 
                please register a nonprofit account or contact support.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button asChild className="bg-volunteer-600 hover:bg-volunteer-700 text-white">
                <Link to="/opportunities">Browse Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 mt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Post a Volunteer Opportunity</h1>
          <p className="text-gray-600 mb-8">
            Complete the form below to create a new volunteer opportunity. All required fields are marked with an asterisk (*).
          </p>
          
          <OpportunityForm onSuccess={() => navigate('/opportunities')} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
