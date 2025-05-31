import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

const HomeAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/assets/hero-animation.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return null;

  return (
    <Lottie 
      animationData={animationData} 
      loop={true} 
      className="relative w-full h-auto max-h-[500px]" 
    />
  );
};

export default HomeAnimation;
