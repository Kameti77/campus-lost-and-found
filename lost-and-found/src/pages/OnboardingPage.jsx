import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchOutline, IoNotificationsOutline, IoCheckmarkCircleOutline, IoArrowForward } from 'react-icons/io5';

function OnboardingPage() {
  const navigate = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animations on mount
  useState(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  const features = [
    {
      icon: IoSearchOutline,
      title: "Browse & Search",
      description: "Instantly see what's been lost and found on campus. Filter by category, date, or location.",
      delay: "0ms"
    },
    {
      icon: IoNotificationsOutline,
      title: "Get Notified",
      description: "Enable notifications and we'll alert you the moment someone reports finding your item.",
      delay: "100ms"
    },
    {
      icon: IoCheckmarkCircleOutline,
      title: "Pick It Up",
      description: "See exactly where your item is being held. Head there with your ID and get it back.",
      delay: "200ms"
    }
  ];

  const stats = [
    { number: "500+", label: "Students" },
    { number: "200+", label: "Items Found" },
    { number: "< 24hrs", label: "Avg Recovery" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:py-20">

        {/* Header */}
        <div className="text-center mb-16 sm:mb-24">
          <div className={`inline-flex items-center gap-3 mb-6 transition-all duration-700 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg">
              🔍
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900">
              Lost & Found
            </h1>
          </div>

          <h2 className={`text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6 transition-all duration-700 delay-100 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            Find Your Stuff.
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Fast.
            </span>
          </h2>

          <p className={`text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 transition-all duration-700 delay-200 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            The faster, smarter way for Full Sail students to report and recover lost items on campus.
            No more checking five different places or posting in random Discord channels.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <button
              onClick={() => navigate('/signup')}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <IoArrowForward className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>

      

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map(({ icon: Icon, title, description, delay }) => (
            <div
              key={title}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100`}
              style={{ animationDelay: delay }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Icon className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* How It Works - Visual Timeline */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 mb-20">
          <h3 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">
            How It Works
          </h3>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-orange-300 hidden sm:block" />

            <div className="space-y-8">
              {[
                { step: "1", title: "Report Your Lost Item", desc: "Quick form with photo, location, and private description for verification." },
                { step: "2", title: "Someone Finds It", desc: "Another student finds your item and reports it through the app." },
                { step: "3", title: "You Get Notified", desc: "Push notification alerts you immediately — even if the app is closed." },
                { step: "4", title: "Pick It Up", desc: "Check the post for location (usually front desk or security). Bring your ID and claim it." }
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg z-10">
                    {step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{title}</h4>
                    <p className="text-gray-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Never Lose Anything Again?
          </h3>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of Full Sail students who recover their lost items in hours, not days.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-5 bg-white text-orange-600 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Sign Up with Full Sail Email
          </button>
          <p className="text-orange-100 text-sm mt-4">
            Free forever. No credit card required.
          </p>
        </div>

      </div>

      {/* Add required CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

    </div>
  );
}

export default OnboardingPage;