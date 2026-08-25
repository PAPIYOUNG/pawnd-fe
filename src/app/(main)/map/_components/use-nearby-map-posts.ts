'use client';

import { useCallback, useEffect, useState } from 'react';

import { getNearbyMapPosts } from '@/services/map.service';
import type { CurrentLocation, MapDataState } from '@/types/map';

import { NEARBY_DEBOUNCE_MS, NEARBY_POST_LIMIT } from './map-page.constants';
import type { PostTypeFilter, DistanceFilter } from './map-page.types';

/** ผลลัพธ์ของ hook ที่จัดการข้อมูล nearby และคำสั่ง retry ของ request เดิม */
interface UseNearbyMapPostsResult {
  data: MapDataState;
  retry: () => void;
}

/**
 * โหลดประกาศรอบ current location ด้วย debounce และ AbortController
 * คง query, lifecycle, error message และ dependency เดิมของ MapPageClient
 */
export function useNearbyMapPosts(
  currentLocation: CurrentLocation | null,
  distanceFilter: DistanceFilter,
  postTypeFilter: PostTypeFilter,
): UseNearbyMapPostsResult {
  const [nearbyData, setNearbyData] = useState<MapDataState>({
    features: [],
    isLoading: false,
    errorMessage: null,
  });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      const loadNearbyPosts = async () => {
        setNearbyData((currentData) => ({
          features: currentData.features,
          isLoading: true,
          errorMessage: null,
        }));

        try {
          const collection = await getNearbyMapPosts(
            {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              radiusKm: Number(distanceFilter),
              ...(postTypeFilter === 'ALL' ? {} : { type: postTypeFilter }),
              limit: NEARBY_POST_LIMIT,
            },
            controller.signal,
          );

          setNearbyData({
            features: collection.features,
            isLoading: false,
            errorMessage: null,
          });
        } catch {
          if (controller.signal.aborted) {
            return;
          }

          setNearbyData((currentData) => ({
            features: currentData.features,
            isLoading: false,
            errorMessage:
              'ไม่สามารถโหลดประกาศใกล้ตำแหน่งคุณได้ กรุณาลองใหม่อีกครั้ง',
          }));
        }
      };

      void loadNearbyPosts();
    }, NEARBY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentLocation, distanceFilter, postTypeFilter, retryToken]);

  const retry = useCallback(() => {
    setRetryToken((token) => token + 1);
  }, []);

  return { data: nearbyData, retry };
}
