import React from 'react';

const TrendingSection = () => {
  return (
    <div className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[500px] group overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              alt="Women's Collection"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-white text-2xl font-bold mb-4">Women's Collection</h3>
              <button className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
          
          <div className="relative h-[500px] group overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              alt="Men's Collection"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-white text-2xl font-bold mb-4">Men's Collection</h3>
              <button className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;