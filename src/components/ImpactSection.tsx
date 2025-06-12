
import React from 'react';
import { Progress } from '@/components/ui/progress';

const ImpactSection = () => {
  const impactStats = [
    { label: "Volunteers", count: "10,000+", color: "bg-volunteer-500" },
    { label: "Organizations", count: "500+", color: "bg-nonprofit-500" },
    { label: "Hours Contributed", count: "45,000+", color: "bg-volunteer-600" },
    { label: "Projects Completed", count: "1,200+", color: "bg-nonprofit-600" }
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-10 bg-volunteer-200 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 opacity-10 bg-nonprofit-200 rounded-tr-full"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Together, we're creating meaningful change in communities across the country. Here's what we've accomplished together.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2">
                <span className={`inline-block p-4 rounded-full ${stat.color} text-white`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                    {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                    {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
                  </svg>
                </span>
              </div>
              <h3 className="text-3xl font-bold">{stat.count}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Environmental Projects</span>
              <span className="font-medium">75%</span>
            </div>
            <Progress className="h-2" value={75} />
          </div>
          
          <div className="mb-12">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Education Initiatives</span>
              <span className="font-medium">65%</span>
            </div>
            <Progress className="h-2" value={65} />
          </div>
          
          <div className="mb-12">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Community Development</span>
              <span className="font-medium">90%</span>
            </div>
            <Progress className="h-2" value={90} />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Health & Wellness</span>
              <span className="font-medium">80%</span>
            </div>
            <Progress className="h-2" value={80} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
