import React, { useState, useEffect } from "react";

let setStoredValues = new Map();

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;

    let store = setStoredValues.get(key);
    if (store) {
      store.forEach((setStoredValueOther) => setStoredValueOther(valueToStore));
    }

    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  const checkLocalStorage = (e) => {
    if (e.storageArea === window.localStorage) {
      if (key === e.key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    }
  };

  useEffect(() => {
    if (setStoredValues.has(key)) {
      setStoredValues.set(key, [...setStoredValues.get(key), setStoredValue]);
    } else {
      setStoredValues.set(key, [setStoredValue]);
    }

    window.addEventListener("storage", checkLocalStorage);

    return () => {
      setStoredValues.set(
        key,
        setStoredValues.get(key).filter((setter) => setter != setStoredValue)
      );
      window.removeEventListener("storage", checkLocalStorage);
    };
  }, [key]);

  return [storedValue, setValue];
}
