"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

interface SliderDataItem {
  image: string;
  category: string;
  title: string;
}

interface SliderProps {
  sliderData: SliderDataItem[];
}

const Slider: React.FC<SliderProps> = ({ sliderData }) => {
  return (
    <section className="w-screen max-w-none mb-10 relative left-1/2 right-1/2 -mx-[50vw] px-0">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, renderBullet: (index, className) => `<span class='${className} !bg-red-600 !w-5 !h-5 !mx-2'></span>` }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        spaceBetween={24}
        slidesPerView={1}
        loop
        className="rounded-none overflow-hidden shadow-lg w-full"
      >
        {sliderData.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full h-[60vh] min-h-[420px] max-h-[90vh] relative flex items-end">
              <Image src={slide.image} alt={slide.title} fill className="object-cover w-full h-full absolute inset-0" />
              <div className="relative z-10 w-full p-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end h-full">
                <span className="text-white text-xs font-bold uppercase mb-2 bg-black/60 px-3 py-1 rounded-full self-start shadow">{slide.category}</span>
                <h2 className="text-white text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">{slide.title}</h2>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Slider; 