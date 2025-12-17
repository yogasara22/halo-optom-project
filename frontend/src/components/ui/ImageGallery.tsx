'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ImageGalleryProps {
  mainImage: string;
  additionalImages?: string[];
  alt: string;
}

const ImageGallery = ({ mainImage, additionalImages = [], alt }: ImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState<string>(mainImage);
  const allImages = [mainImage, ...additionalImages];

  const handleThumbnailClick = (image: string) => {
    setCurrentImage(image);
  };

  const handlePrevious = () => {
    const currentIndex = allImages.indexOf(currentImage);
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setCurrentImage(allImages[newIndex]);
  };

  const handleNext = () => {
    const currentIndex = allImages.indexOf(currentImage);
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentImage(allImages[newIndex]);
  };

  // If there's only the main image, render a simple image display
  if (additionalImages.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
        <div className="relative w-full h-80">
          <Image
            src={mainImage}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-contain rounded-md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      {/* Main Image with Navigation Arrows */}
      <div className="relative w-full h-80">
        <Image
          src={currentImage}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-contain rounded-md"
        />
        
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
          aria-label="Previous image"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
          aria-label="Next image"
        >
          <FiChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(image)}
            className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${currentImage === image ? 'border-blue-500' : 'border-transparent'}`}
          >
            <Image
              src={image}
              alt={`${alt} thumbnail ${index + 1}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;