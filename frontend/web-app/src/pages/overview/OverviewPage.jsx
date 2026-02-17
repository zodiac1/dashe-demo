import React, { useRef, useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';

import './Overview.css';

// Helper to load leaflet CSS only once
function useLeafletCss() {
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);
}

export default function OverviewPage() {
  const { session } = useSession();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [allMarkers, setAllMarkers] = useState([]); // all fetched markers
  const [markers, setMarkers] = useState([]); // currently visible markers
  const [timeline, setTimeline] = useState({
    min: 0,
    max: 0,
    value: 0,
    playing: false
  });
  const [startDate, setStartDate] = useState('2021-04-01');
  const [endDate, setEndDate] = useState('2027-04-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useLeafletCss();

  // Load Leaflet JS only once
  useEffect(() => {
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMap(window.L);
      document.body.appendChild(script);
    } else {
      setMap(window.L);
    }
  }, []);

  // Fetch property sales data or generate random pins if empty
  useEffect(() => {
    if (!map) return;
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/property-sales?start_date=${startDate}&end_date=${endDate}`, {
      headers: session.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch property sales');
        return res.json();
      })
      .then(data => {
        // Always assign a color per userid and use it in markers
        const userColors = {};
        const colorPalette = [
          '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6',
          '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3',
          '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
        ];
        let colorIdx = 0;
        let pins = (Array.isArray(data) ? data : []).map(item => {
          if (!userColors[item.userid]) {
            userColors[item.userid] = colorPalette[colorIdx % colorPalette.length];
            colorIdx++;
          }
          return {
            latitude: item.latitude,
            longitude: item.longitude,
            label: `<b>Property:</b> ${item.address1}<br> <b>Sold by:</b> ${item.username || item.userid}<br> <b>Sold for:</b> £${item.sold_for.toLocaleString()}`,
            color: userColors[item.userid],
            sold_date: item.sold_date || item.date || null
          };
        });
        // Sort pins by ascending sold_date (nulls last)
        pins = pins.sort((a, b) => {
          if (!a.sold_date && !b.sold_date) return 0;
          if (!a.sold_date) return 1;
          if (!b.sold_date) return -1;
          return new Date(a.sold_date) - new Date(b.sold_date);
        });
        setAllMarkers(pins);
        setTimeline(tl => ({
          ...tl,
          min: 0,
          max: pins.length > 0 ? pins.length - 1 : 0,
          value: pins.length > 0 ? pins.length - 1 : 0,
          playing: false
        }));
        setMarkers(pins.length > 0 ? [pins[0]] : []);
      })
      .catch(e => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [map, startDate, endDate, session.access_token]);

  // Timeline playback effect
  useEffect(() => {
    if (!timeline.playing) return;
    if (timeline.value >= timeline.max) return;
    const id = setTimeout(() => {
      setTimeline(tl => ({ ...tl, value: Math.min(tl.value + 1, tl.max) }));
    }, 600);
    return () => clearTimeout(id);
  }, [timeline.playing, timeline.value, timeline.max]);

  // Update visible markers when timeline changes
  useEffect(() => {
    if (allMarkers.length === 0) return;
    setMarkers(allMarkers.slice(0, timeline.value + 1));
  }, [allMarkers, timeline.value]);

  // Initialize and update map
  useEffect(() => {
    if (!map || !mapRef.current) return;
    if (!mapRef.current._leaflet_map) {
      // Center on UK
      const leafletMap = map.map(mapRef.current).setView([54.5, -3], 6);
      map.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap);
      mapRef.current._leaflet_map = leafletMap;
    }
    const leafletMap = mapRef.current._leaflet_map;
    // Remove old markers
    if (leafletMap._markerLayer) {
      leafletMap.removeLayer(leafletMap._markerLayer);
    }
    // Add new markers
    const markerLayer = map.layerGroup();
    (markers || []).forEach(item => {
      if (item.latitude && item.longitude) {
        // Create a custom SVG icon for each userid color
        const svg = encodeURIComponent(`
          <svg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'>
            <ellipse cx='16' cy='20' rx='12' ry='16' fill='${item.color}' stroke='#222' stroke-width='2'/>
            <circle cx='16' cy='20' r='6' fill='#fff' stroke='#222' stroke-width='2'/>
          </svg>
        `);
        const icon = map.icon({
          iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
          iconSize: [32, 48],
          iconAnchor: [16, 44],
          popupAnchor: [0, -40],
        });
        map.marker([item.latitude, item.longitude], { icon })
          .addTo(markerLayer)
          .bindPopup(item.label || 'Property');
      }
    });
    markerLayer.addTo(leafletMap);
    leafletMap._markerLayer = markerLayer;
  }, [map, markers]);

  return (
    <div className="overview-page">
      <div className="overview-card">
        <h2 className="overview-title">🏡 Property Sales Overview</h2>
        <div className="overview-date-form-wrapper">
          <form
            className="overview-date-form"
            onSubmit={e => e.preventDefault()}>
            <label className="overview-date-label overview-date-label-start">
              <span>Start</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="overview-date-input overview-date-input-start"
              />
            </label>
            <label className="overview-date-label overview-date-label-end">
              <span>End</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="overview-date-input overview-date-input-end"
              />
            </label>
          </form>
        </div>
        <div className="overview-divider" />
        {error && <div className="overview-error"> {error} </div>}
        {loading && <div className="overview-loading">Loading map data...</div>}
        <div className="overview-timeline-section">
          <div className="overview-timeline-controls">
            <button
              onClick={() => setTimeline(tl => ({...tl, playing: !tl.playing}))}
              className={timeline.playing ? 'overview-timeline-play playing' : 'overview-timeline-play'}
              title={timeline.playing ? 'Pause' : 'Play'}
            >
              {timeline.playing ? '❚❚' : '▶︎'}
            </button>
            <input
              type="range"
              min={timeline.min}
              max={timeline.max}
              value={timeline.value}
              onChange={e => setTimeline(tl => ({...tl, value: Number(e.target.value), playing: false}))}
              className="overview-timeline-slider"
              disabled={timeline.max === 0}
            />
            <span className="overview-timeline-count">
              {timeline.value + 1} / {timeline.max + 1}
            </span>
            <button
              onClick={() => setTimeline(tl => ({...tl, value: tl.min, playing: false}))}
              className="overview-timeline-reset"
              title="Reset Timeline"
              disabled={timeline.value === timeline.min}
            >
              Reset
            </button>
          </div>
          <div className="overview-timeline-date">
            Date: <span>{markers.length > 0 && markers[markers.length - 1] && markers[markers.length - 1].sold_date
              ? new Date(markers[markers.length - 1].sold_date).toLocaleDateString('en-GB')
              : 'N/A'}</span>
          </div>
        </div>
        <div className="overview-divider" />
        <div
          ref={mapRef}
          className="overview-map"
        />
      </div>
    </div>
  );
}
