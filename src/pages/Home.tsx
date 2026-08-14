import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import banner from "../assets/banner.jpeg";




const HomePage = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full">
        {/* <Carousel
          showThumbs={false}
          autoPlay
          infiniteLoop
          interval={3000}
          showStatus={false}
          swipeable
        > */}
          <div>
            <img
              src={banner}
              alt="Banner"
              className="w-full h-auto object-cover"
            />
          </div>

        {/* </Carousel> */}
      </div>
    </div>
  );
};

export default HomePage;