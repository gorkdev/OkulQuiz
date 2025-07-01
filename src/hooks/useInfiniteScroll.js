import { useEffect, useRef, useState } from "react";

const useInfiniteScroll = (
  fetchMoreData,
  initialData = [],
  itemsPerPage = 6,
  resetKey = ""
) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(null);
  const observerRef = useRef(null);

  // Reset when resetKey changes
  useEffect(() => {
    setPage(1);
    setItems(initialData);
    setHasMore(true);
  }, [resetKey, initialData]);

  // Fetch more data when page changes
  useEffect(() => {
    if (page === 1) return; // Initial data already loaded

    const loadMore = async () => {
      setIsLoading(true);
      try {
        const newData = await fetchMoreData(page, itemsPerPage);

        if (newData.length === 0) {
          setHasMore(false);
        } else {
          setItems((prev) => [...prev, ...newData]);
        }
      } catch (error) {
        console.error("Error loading more data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMore();
  }, [page, itemsPerPage, fetchMoreData]);

  // Intersection Observer setup
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [hasMore, isLoading]);

  return {
    visibleItems: items,
    hasMore,
    isLoading,
    loadingRef,
  };
};

export default useInfiniteScroll;
