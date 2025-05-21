import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CACHE_KEY = 'wispay_users_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes for user data
const BALANCE_REFRESH_INTERVAL = 10000; // 10 seconds

const WispayContext = createContext();

export const WispayProvider = ({ children }) => {
  const [wispayData, setWispayData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update cache with current data
  const updateCache = (users) => {
    const cacheData = {
      users,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  // Fetch fresh balances only
  const fetchBalances = useCallback(async () => {
    try {
      const URl = process.env.REACT_APP_URL || "";
      const res = await fetch(`${URl}/api/wispay/user/balances`);
      if (!res.ok) throw new Error("Failed to fetch balances");
      const balances = await res.json();

      setWispayData((prevData) => {
        const updatedData = prevData.map((user) => {
          const updatedBalance = balances.find((b) => b.rfid === user.rfid);
          return updatedBalance
            ? { ...user, balance: updatedBalance.balance }
            : user;
        });

        updateCache(updatedData);
        return updatedData;
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Balance update error:", err);
    }
  }, []);

  // Fetch fresh user data
  const fetchFreshData = useCallback(async () => {
    try {
      setLoading(true);
      const URl = process.env.REACT_APP_URL || "";
      const res = await fetch(`${URl}/api/wispay/user`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const response = await res.json();
      const users = response.users || [];

      updateCache(users);
      setWispayData(users);
      setLastUpdated(new Date());
      setError(null);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data from cache if valid
  const loadFromCache = useCallback(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return false;

    try {
      const parsedData = JSON.parse(cachedData);
      const isCacheValid = Date.now() - parsedData.timestamp < CACHE_EXPIRY_MS;

      if (isCacheValid) {
        setWispayData(parsedData.users);
        setLastUpdated(new Date(parsedData.timestamp));
        return true;
      }
    } catch (e) {
      console.error("Failed to parse cache data", e);
    }
    return false;
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      const cacheLoaded = loadFromCache();

      if (!cacheLoaded) {
        await fetchFreshData();
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchFreshData, loadFromCache]);

  // Interval to update balances every 10 seconds
  useEffect(() => {
    const balanceInterval = setInterval(fetchBalances, BALANCE_REFRESH_INTERVAL);
    return () => clearInterval(balanceInterval);
  }, [fetchBalances]);

  return (
    <WispayContext.Provider
      value={{
        wispayData,
        lastUpdated,
        loading,
        error,
        fetchFreshData,
      }}
    >
      {children}
    </WispayContext.Provider>
  );
};

// Custom hook to use context
export const useWispayContext = () => {
  const context = useContext(WispayContext);
  if (!context) {
    throw new Error('useWispayContext must be used within a WispayProvider');
  }
  return context;
};
