import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

/**
 * A text input that uses Geoapify Autocomplete if VITE_MAPS_API_KEY is set.
 * Falls back to a plain input if the key is missing.
 */
const AddressAutocomplete = ({ value, onChange, onPlaceSelect, placeholder, className = "" }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  
  const apiKey = import.meta.env.VITE_MAPS_API_KEY;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (text) => {
    if (!apiKey || !text || text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${apiKey}`);
      const data = await res.json();
      if (data.features) {
        setSuggestions(data.features);
      }
    } catch (error) {
      console.error("Geoapify error:", error);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange?.(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(val);
        setShowDropdown(true);
      }, 500);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (feature) => {
    const props = feature.properties;
    const parsed = {
      formatted: props.formatted || "",
      city: props.city || props.county || "",
      state: props.state || "",
      country: props.country || "",
      pinCode: props.postcode || "",
    };
    
    onChange?.(parsed.formatted);
    onPlaceSelect?.(parsed);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        value={value || ""}
        onChange={handleInputChange}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        placeholder={placeholder || "Start typing an address..."}
        className={`w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${className}`}
      />
      <MapPin className={`absolute left-3 top-3 h-4 w-4 ${apiKey ? "text-blue-500" : "text-slate-300"}`} />
      
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((feature, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(feature)}
              className="cursor-pointer border-b border-slate-100 px-4 py-2.5 text-sm hover:bg-slate-50 last:border-0"
            >
              {feature.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
