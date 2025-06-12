import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24 hero-gradient text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-volunteer-700/90 via-volunteer-600/80 to-nonprofit-600/90 z-0"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-white/5 rounded-tl-full z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of volunteers and organizations creating positive
            change in communities worldwide.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-volunteer-700 hover:bg-gray-100"
            >
              <Link to="/register">Sign Up Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-volunteer-500 text-volunteer-500 hover:bg-volunteer-500 hover:text-white"
            >
              <Link to="/opportunities">Browse Opportunities</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
