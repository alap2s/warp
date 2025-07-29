import { Warp } from '@/lib/warp';

export const getCurrentCoordinates = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
};

export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error('Google Maps API key is missing.');
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        } else {
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    } catch (error) {
        console.error('Error with reverse geocoding:', error);
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
};

export const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error('Google Maps API key is missing.');
        return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].geometry.location;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error with geocoding:', error);
        return null;
    }
};

const calculateDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const formatDistance = (
    userCoords: { lat: number; lng: number } | null, 
    warp: Warp | null | undefined
): string | null => {
    if (!userCoords || !warp || !warp.coordinates) {
        return null;
    }

    const distanceKm = calculateDistance(userCoords, warp.coordinates);

    if (distanceKm < 1) {
        return `${distanceKm.toFixed(1)}km`;
    }
    if (distanceKm <= 99) {
        return `${Math.round(distanceKm)}km`;
    }
    return 'Far';
}; 