import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * @file MapBlock.tsx
 * @description This file is responsible for the map component that is used to display the listings on the map. This 
 * component is used/referenced in the pageList/page.tsx file to display the map of the listings after filtering. 
 */

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_SECRET_KEY;

export type Listing = {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
  address: string;
  photoUrls: string[];
};

interface MapProps {
  listings: Listing[];
}

const MapBlock: React.FC<MapProps> = ({ listings }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (
      !mapContainerRef.current || mapRef.current || listings.length === 0
    )
      return;

    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-112.074, 33.4484],
      zoom: 9,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      addMarkers();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [listings]);

  const addMarkers = () => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return;

      const el = document.createElement('img');
      el.src = '/pin.png';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({
        offset: 40,
        anchor: 'bottom',
        closeButton: true,
        closeOnClick: false,
        maxWidth: '250px' 
      }).setHTML(`
        <div style="color:black; text-align: center;">
          <strong style="font-size: 1.1rem;">$${listing.price.toLocaleString()}</strong><br/>
          <span style="font-size: 0.95rem;">${listing.address}</span><br/>
          <img 
            src="${listing.photoUrls?.[0] || '/placeholder.jpg'}" 
            alt="Home" 
            style="width: 100%; height: 20%; object-fit: cover; border-radius: 6px; margin-top: 6px;" 
          />
        </div>
      `);
      


      el.addEventListener('click', (e) => {
        e.stopPropagation();
        mapRef.current?.flyTo({
          center: [listing.longitude, listing.latitude],
          zoom: 14,
          speed: 2,
          curve: 1.5,
          duration: 800,
          offset: [0, 160] 
        });

        popupRef.current?.remove();
        popup.addTo(mapRef.current!);
        popupRef.current = popup;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.longitude, listing.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
      bounds.extend([listing.longitude, listing.latitude]);
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 60 });
    }
  };

  return (
    <div className="w-full h-[400px] rounded-xl my-6">
      <div
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default MapBlock;
