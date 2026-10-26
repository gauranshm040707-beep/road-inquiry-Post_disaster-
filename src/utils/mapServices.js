/**
 * Map & Geolocation API Services for Disaster Road Inspector
 * Supports Google Maps API, Mapbox, MapTiler, and OpenStreetMap fallbacks.
 */

// Available Tile Layer Definitions
export function getTileLayers(settings = {}) {
  const googleApiKey = settings.googleApiKey || import.meta.env.VITE_GOOGLE_API_KEY || '';
  const mapboxToken = settings.mapboxAccessToken || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const maptilerKey = settings.maptilerApiKey || import.meta.env.VITE_MAPTILER_API_KEY || '';

  const layers = {
    // 1. Google Maps Hybrid (High-Resolution Satellite + Road Infrastructure)
    google_hybrid: {
      id: 'google_hybrid',
      name: 'Google Hybrid (Satellite + Roads)',
      badge: 'GOOGLE MAPS',
      badgeColor: 'emerald',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> Satellite & Roads Imagery',
      maxZoom: 20
    },

    // 2. Google Maps Road Network
    google_roads: {
      id: 'google_roads',
      name: 'Google Roads & Highways',
      badge: 'GOOGLE MAPS',
      badgeColor: 'emerald',
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> Road Infrastructure',
      maxZoom: 20
    },

    // 3. Google Maps Topographic Terrain & Contour
    google_terrain: {
      id: 'google_terrain',
      name: 'Google Topographic Terrain',
      badge: 'TOPOGRAPHY',
      badgeColor: 'amber',
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> Elevation & Terrain Contours',
      maxZoom: 20
    },

    // 4. Google Maps Pure Satellite
    google_satellite: {
      id: 'google_satellite',
      name: 'Google Satellite Recon',
      badge: 'SATELLITE',
      badgeColor: 'blue',
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> High-Res Orthophoto',
      maxZoom: 20
    },

    // 5. CARTO Tactical Dark (Optimal for nighttime triage operations)
    dark: {
      id: 'dark',
      name: 'Tactical Dark (Night Ops)',
      badge: 'TACTICAL',
      badgeColor: 'purple',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19
    },

    // 6. Esri World Imagery (ArcGIS Satellite)
    satellite: {
      id: 'satellite',
      name: 'Esri Satellite Recon',
      badge: 'ESRI',
      badgeColor: 'sky',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Earthstar Geographics',
      maxZoom: 19
    },

    // 7. OpenStreetMap Standard
    streets: {
      id: 'streets',
      name: 'OpenStreetMap Standard',
      badge: 'OSM',
      badgeColor: 'slate',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  };

  // Add Mapbox layers if an access token is provided
  if (mapboxToken) {
    layers.mapbox_dark = {
      id: 'mapbox_dark',
      name: 'Mapbox Tactical Dark',
      badge: 'MAPBOX',
      badgeColor: 'indigo',
      url: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20
    };
    layers.mapbox_satellite = {
      id: 'mapbox_satellite',
      name: 'Mapbox Satellite Streets',
      badge: 'MAPBOX',
      badgeColor: 'indigo',
      url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20
    };
  }

  // Add MapTiler layers if an API key is provided
  if (maptilerKey) {
    layers.maptiler_topo = {
      id: 'maptiler_topo',
      name: 'MapTiler Outdoor 3D/Topo',
      badge: 'MAPTILER',
      badgeColor: 'rose',
      url: `https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; OpenStreetMap',
      maxZoom: 20
    };
  }

  return layers;
}

/**
 * Search locations/highways using Google Geocoding API with instant fallback to Nominatim
 */
export async function searchAddressOrHighway(query, googleApiKey) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();

  // 1. Try Google Maps Geocoding API if key is present
  if (googleApiKey && !googleApiKey.includes('placeholder')) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        cleanQuery + ', India'
      )}&components=country:IN&key=${googleApiKey}`;
      
      const res = await fetch(gUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.length > 0) {
          return data.results.slice(0, 5).map(item => ({
            name: item.formatted_address.split(',')[0],
            displayName: item.formatted_address,
            lat: item.geometry.location.lat,
            lng: item.geometry.location.lng,
            provider: 'Google Maps Geocoding API'
          }));
        }
      }
    } catch (err) {
      console.warn('Google Geocoding API failed or blocked, falling back to Nominatim:', err);
    }
  }

  // 2. High-performance fallback: OpenStreetMap Nominatim API
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery
    )}&countrycodes=in&limit=5`;
    const res = await fetch(osmUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(item => ({
          name: item.name || item.display_name.split(',')[0],
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          provider: 'OpenStreetMap (Nominatim Free Engine)'
        }));
      }
    }
  } catch (err) {
    console.error('All geocoding services failed:', err);
  }

  return [];
}

/**
 * Reverse Geocode GPS coordinates to Road Name & Sector
 */
export async function reverseGeocodeCoordinates(lat, lng, googleApiKey) {
  if (!lat || !lng) return null;

  // 1. Try Google Maps Geocoding API first
  if (googleApiKey && !googleApiKey.includes('placeholder')) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
      const res = await fetch(gUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.length > 0) {
          const first = data.results[0];
          const roadPart = first.address_components.find(c => 
            c.types.includes('route') || c.types.includes('point_of_interest')
          );
          const statePart = first.address_components.find(c => 
            c.types.includes('administrative_area_level_1')
          );
          const districtPart = first.address_components.find(c => 
            c.types.includes('administrative_area_level_2') || c.types.includes('locality')
          );

          const roadName = roadPart ? roadPart.long_name : first.formatted_address.split(',')[0];
          const sector = `${statePart?.long_name || 'India'} - ${districtPart?.long_name || 'Corridor'}`;

          return {
            roadName,
            sector,
            fullAddress: first.formatted_address,
            provider: 'Google Maps Geocoding API'
          };
        }
      }
    } catch (err) {
      console.warn('Google Reverse Geocoding failed, falling back to OSM:', err);
    }
  }

  // 2. Fallback to Nominatim
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(osmUrl, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const roadName = addr.road || addr.highway || addr.suburb || addr.neighbourhood || data.name || 'Unnamed Regional Corridor';
        const state = addr.state || 'India';
        const district = addr.state_district || addr.county || addr.city || 'District';
        const sector = `${state} - ${district} Sector`;

        return {
          roadName,
          sector,
          fullAddress: data.display_name,
          provider: 'OpenStreetMap (Nominatim Free Engine)'
        };
      }
    }
  } catch (err) {
    console.error('Reverse geocode failed:', err);
  }

  return null;
}

/**
 * Test Google Maps API Key
 */
export async function testGoogleMapsApiKey(apiKey) {
  if (!apiKey || apiKey.trim().length < 10) {
    return {
      success: false,
      status: 'error',
      message: 'Please enter a valid Google Cloud / Maps API key.'
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=28.6139,77.2090&key=${apiKey.trim()}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK') {
      return {
        success: true,
        status: 'active',
        message: 'Google Maps API Key is active with Geocoding and Map Services enabled!'
      };
    } else if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('billing')) {
      return {
        success: false,
        status: 'billing_required',
        message: 'API Key is recognized, but Google Cloud Billing must be enabled on your project to use Geocoding API. Google Tile basemaps will continue to load normally.'
      };
    } else {
      return {
        success: false,
        status: 'api_error',
        message: data.error_message || `Google Maps returned status: ${data.status}`
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 'network_or_cors',
      message: 'Network check finished. Note: Google tile basemaps will stream directly in Leaflet.'
    };
  }
}
