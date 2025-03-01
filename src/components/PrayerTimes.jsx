import React, { useState, useEffect } from "react";
import { WiSunrise } from "react-icons/wi"; // for Fajr
import { TbSunrise } from "react-icons/tb"; // Sunrise
import { IoSunnyOutline } from "react-icons/io5"; // Dhuhur
import { IoSunnySharp } from "react-icons/io5"; // Asir
import { TbSunset } from "react-icons/tb"; // Maghrib
import { FaRegMoon } from "react-icons/fa"; // Isha

const PrayerTimes = () => {
  const [selectedCity, setSelectedCity] = useState("المدينة المنورة"); // default
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [nextPrayer, setNextPrayer] = useState(null);

  // Arabic names for the prayers
  const prayerNames = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  // Function to convert 24-hour time format to 12-hour format with AM/PM in Arabic
const convertTo12HourFormat = (time24) => {
  const [hours, minutes] = time24.split(":");
  let hour = parseInt(hours, 10);
  const period = hour >= 12 ? "م" : "ص";
  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }
  return `${hour}:${minutes} ${period}`;
};

// Function to calculate the time remaining for the next prayer
const calculateTimeRemaining = (nextPrayerTime) => {
  const currentTime = new Date();
  const nextPrayer = new Date();
  const [hours, minutes] = nextPrayerTime.split(":");
  const nextPrayerDate = new Date(
    nextPrayer.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0)
  );
  const diffInMs = nextPrayerDate - currentTime; // milliseconds
  const diffInMinutes = Math.floor(diffInMs / 60000); // Convert milliseconds to minutes
  const hoursRemaining = Math.floor(diffInMinutes / 60); // hours
  const minutesRemaining = diffInMinutes % 60; // remaining minutes

  return { hours: hoursRemaining, minutes: minutesRemaining };
};

  // Function to get current time in 12-hour format
  const updateCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const period = hours >= 12 ? "مساءً" : "صباحًا";
    const hour = hours % 12 === 0 ? 12 : hours % 12; // Convert to 12-hour format
    setCurrentTime(`${hour}:${minutes}:${seconds} ${period}`);
  };

  // Icons for each prayer name
  const prayerIcons = {
    Fajr: <WiSunrise size={30} />,   // For Fajr
    Sunrise: <TbSunrise size={30} />,  // For Sunrise
    Dhuhr: <IoSunnyOutline size={30} />,  // For Dhuhr
    Asr: <IoSunnySharp size={30} />,   // For Asr
    Maghrib: <TbSunset size={30} />,  // For Maghrib
    Isha: <FaRegMoon size={30} />,    // For Isha
  };

  // Function to fetch prayer times from the API (aladhan) based on the selected city
  const fetchPrayerTimes = async (city) => {
    const cityMapping = {
      "المدينة المنورة": "Medina",
      الرياض: "Riyadh",
      جدة: "Jeddah",
      مكة: "Mecca",
      أبها: "Abha",
      تبوك: "Tabuk",
      عسير: "Asir",
      جازان: "Jazan",
      نجران: "Najran",
      حائل: "Hail",
    };
    const cityName = cityMapping[city];

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?country=SA&city=${cityName}` // Fetch prayer times for the city
      );
      const data = await response.json();
      if (data.data) {
        setPrayerTimes(data.data.timings);
      }
    } catch (error) {
      console.error("حدث خطأ", error);
    }
  };

  // Fetch prayer times and update current time
  useEffect(() => {
    fetchPrayerTimes(selectedCity);
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000); // Update current time every second
    return () => clearInterval(interval); 
  }, [selectedCity]);

  // Handle city selection change
  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  // Function to determine the next prayer and the remaining time
  const getNextPrayer = () => {
    if (!prayerTimes) return null;

    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    let nextPrayerTime = null;
    let nextPrayerName = "";

    // Loop through prayers to find the next prayer
    for (const prayer in prayerTimes) {
      const [hours, minutes] = prayerTimes[prayer].split(":");
      const prayerHour = parseInt(hours, 10);
      const prayerMinutes = parseInt(minutes, 10);

      if (
        prayerHour > currentHour ||
        (prayerHour === currentHour && prayerMinutes > currentMinutes)
      ) {
        nextPrayerTime = prayerTimes[prayer];
        nextPrayerName = prayerNames[prayer];
        break;
      }
    }

    if (nextPrayerTime) {
      const { hours, minutes } = calculateTimeRemaining(nextPrayerTime);
      setNextPrayer({
        name: nextPrayerName,
        time: convertTo12HourFormat(nextPrayerTime),
        remaining: `${hours} ساعة و ${minutes} دقيقة`,
      });
    }
  };

  // Update the next prayer when prayer times change
  useEffect(() => {
    getNextPrayer();
  }, [prayerTimes]);

  return (
    <div className="w-full h-screen bg-gradient-to-r from-[#240165] to-[#05001c] flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 text-center">
{/* CITY SELECT OPTION */}
      <div className="text-white text-right w-full sm:w-1/2 lg:w-1/3 mt-10 sm:mt-0">
        <select
          value={selectedCity}
          onChange={handleCityChange}
          className="bg-[#3b0c45] text-white w-full p-2 rounded-md shadow-md"
        >
          <option value="المدينة المنورة">المدينة المنورة</option>
          <option value="الرياض">الرياض</option>
          <option value="جدة">جدة</option>
          <option value="مكة">مكة</option>
          <option value="أبها">أبها</option>
          <option value="تبوك">تبوك</option>
          <option value="عسير">عسير</option>
          <option value="جازان">جازان</option>
          <option value="نجران">نجران</option>
          <option value="حائل">حائل</option>
        </select>
      </div>

      {/* CITY NAME + DATES */}
      <div className="text-white text-right w-full sm:w-1/2 lg:w-1/3 mt-5 sm:mt-0">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl text-center">
          {selectedCity}
        </h1>
        <div className="mt-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-center">
            {new Date().toLocaleDateString("ar-SA")}
          </h2>
        </div>

        <hr className="w-full sm:w-11/12 my-4 mx-auto border-white" />
      </div>

      {/* CURRENT TIME */}
      <div className="text-white text-xl sm:text-2xl">
        <p>التوقيت الان: {currentTime}</p>
      </div>

      {/* NEXT PRAYER */}
      {nextPrayer ? (
        <div className="text-white text-xl sm:text-2xl mt-5">
          <p>
            <strong>الصلاة القادمة:</strong> {nextPrayer.name} في{" "}
            {nextPrayer.time}
          </p>
          <p>
            <strong>يتبقى على رفع الأذان:</strong> {nextPrayer.remaining}
          </p>
        </div>
      ) : (
        <div className="text-white text-xl sm:text-2xl">
          يتم تحميل البيانات...
        </div>
      )}

      {/* PRAYER TIMINGS CARDS (Only Selected Prayers) */}
      <div className="flex flex-wrap justify-center items-center mt-10 gap-4 flex-row-reverse">
  {prayerTimes ? (
    Object.keys(prayerNames).map((prayer, index) => (
      <div
        key={index}
        className="p-6 bg-[#3b0c45] border-2 border-white rounded-lg shadow-xl w-32 sm:w-40 lg:w-48 h-40 flex flex-col justify-center items-center text-white transform transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl">
          {prayerNames[prayer]}
        </h1>
        <div className="mt-3">
          {prayerIcons[prayer]} {/* Render the corresponding icon */}
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl mt-2">
          {convertTo12HourFormat(prayerTimes[prayer])}
        </h2>
      </div>
    ))
  ) : (
    <div className="text-white text-2xl">يتم تحميل أوقات الصلاة...</div>
  )}
</div>
    </div>
  );
};

export default PrayerTimes;
