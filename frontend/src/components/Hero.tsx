import React from 'react';

const Hero = () => {
  return (
    <div className="relative h-[80vh]">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
          className="w-full h-full object-cover"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">Just Do It</h1>
          <p className="text-xl mb-8">Move. Explore. Bring your boldest.</p>
          <div className="space-x-4">
            <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Shop Men
            </button>
            <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Shop Women
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;