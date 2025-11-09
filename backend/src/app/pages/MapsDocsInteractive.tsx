import { RequestInfo } from "rwsdk/worker";
import { MapsDocsNav } from "@/app/components/MapsDocsNav";

export function MapsDocsInteractive({ ctx }: RequestInfo) {
	return (
		<div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6" }}>
			<header style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "20px", marginBottom: "40px" }}>
				<h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "10px", color: "#1a202c" }}>
					🗺️ Interactive Maps API
				</h1>
				<p style={{ fontSize: "1.1rem", color: "#4a5568" }}>
					Generate embeddable, interactive Mapbox maps with programmatic control
				</p>
			</header>

			<MapsDocsNav currentPage="interactive" />

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Overview
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "15px" }}>
					The <code style={{ backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" }}>/maps/interactive</code> endpoint returns an embeddable HTML page with a fully interactive Mapbox map. Users can pan, zoom, and explore the map. The parent page can control the map programmatically using the postMessage API.
				</p>
				<div style={{ backgroundColor: "#e0f2fe", padding: "20px", borderRadius: "8px", border: "1px solid #7dd3fc", marginBottom: "20px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#0c4a6e", marginBottom: "10px" }}>
						Key Features:
					</h4>
					<ul style={{ color: "#0c4a6e", marginLeft: "20px", marginBottom: "0" }}>
						<li>Fully interactive - users can pan, zoom, and explore</li>
						<li>Embed in iframes or open directly</li>
						<li>Programmatic control via postMessage API</li>
						<li>Pin or circle marker styles</li>
						<li>Custom colors per marker</li>
						<li>All Mapbox themes supported</li>
					</ul>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Endpoint
				</h2>
				<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
					<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
						GET /maps/interactive
					</code>
					<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
						Returns an HTML document with an interactive map
					</p>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Parameters
				</h2>

				<div style={{ marginBottom: "25px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						<span style={{ backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "4px", fontSize: "0.9rem", fontWeight: "700" }}>
							REQUIRED
						</span>{" "}
						markers
					</h3>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						Comma-separated lng,lat pairs. Must contain at least 1 coordinate pair (2 values minimum).
					</p>
					<div style={{ backgroundColor: "#f7fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
						<code style={{ fontSize: "0.95rem", color: "#2d3748" }}>
							-122.4194,37.7749,-74.0060,40.7128
						</code>
					</div>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Optional Parameters
				</h3>

				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
					<thead>
						<tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #cbd5e0" }}>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Parameter</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Type</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Default</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>theme</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>Basic</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Map theme (Basic, Light, Dark, Satellite, etc.)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>width</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>100%</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Map width (pixels or percentage)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>height</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>600px</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Map height (pixels or percentage)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>zoomLevel</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>auto</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Initial zoom level (1-20). Auto-fits if not specified.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerColors</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>hash-based</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Comma-separated colors (hex without #) for each marker. Falls back to hash-based if not provided.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerStyle</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>pin</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>"pin" (default) or "circle"</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>autoFit</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px" }}><code>true</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Auto-fit to show all markers</td>
						</tr>
					</tbody>
				</table>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Basic Examples
				</h2>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Simple Iframe (Pins)
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`<iframe
  src="/maps/interactive?markers=-122.4194,37.7749&theme=Light"
  width="800"
  height="600"
></iframe>`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Circle Markers with Custom Colors
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`<iframe
  src="/maps/interactive?markers=-122.4,37.7,-118.2,34.0&markerStyle=circle&markerColors=FF0000,00FF00&theme=Dark"
  width="100%"
  height="500"
></iframe>`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						React Component
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`function InteractiveMap({ coordinates, theme = "Light" }) {
  const markers = coordinates.flat().join(',');
  const url = \`/maps/interactive?markers=\${markers}&theme=\${theme}\`;

  return (
    <iframe
      src={url}
      width="100%"
      height="600"
      style={{ border: '1px solid #ddd', borderRadius: '8px' }}
      title="Interactive Map"
    />
  );
}

// Usage
<InteractiveMap
  coordinates={[[-122.4194, 37.7749], [-74.0060, 40.7128]]}
  theme="Dark"
/>`}
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #8b5cf6", paddingBottom: "10px" }}>
					postMessage API - Programmatic Control
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "20px" }}>
					Control the map from the parent page using the postMessage API. The map listens for commands and can send responses back.
				</p>

				<div style={{ backgroundColor: "#f3e8ff", padding: "20px", borderRadius: "8px", border: "1px solid #c084fc", marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#581c87", marginBottom: "10px" }}>
						Available Commands:
					</h3>
					<ul style={{ color: "#581c87", marginLeft: "20px", marginBottom: "0" }}>
						<li><strong>flyTo</strong> - Fly to coordinates with animation</li>
						<li><strong>setCenter</strong> - Pan to coordinates</li>
						<li><strong>setZoom</strong> - Change zoom level</li>
						<li><strong>fitBounds</strong> - Fit to all markers or custom bounds</li>
						<li><strong>getCenter</strong> - Query current center (returns response)</li>
						<li><strong>getZoom</strong> - Query current zoom (returns response)</li>
					</ul>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Command Examples
				</h3>

				<div style={{ marginBottom: "25px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						flyTo - Smooth Animation to Location
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`mapFrame.contentWindow.postMessage({
  command: 'flyTo',
  data: {
    lng: -122.4194,
    lat: 37.7749,
    zoom: 12,        // optional
    duration: 2000   // optional, milliseconds
  }
}, '*');`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "25px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						setZoom - Change Zoom Level
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`mapFrame.contentWindow.postMessage({
  command: 'setZoom',
  data: {
    zoom: 14,
    duration: 1000  // optional
  }
}, '*');`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "25px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						fitBounds - Show All Markers
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`// Fit to all markers
mapFrame.contentWindow.postMessage({
  command: 'fitBounds',
  data: { padding: 50 }
}, '*');

// Fit to custom bounds
mapFrame.contentWindow.postMessage({
  command: 'fitBounds',
  data: {
    bounds: [[-122.5, 37.7], [-122.3, 37.8]], // [[minLng, minLat], [maxLng, maxLat]]
    padding: 50,
    duration: 1500
  }
}, '*');`}
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Complete Demo - Multiple Maps with Controls
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "20px" }}>
					This example shows two maps (one with pins, one with circles) controlled by the same buttons.
				</p>
				<div style={{ backgroundColor: "#1a202c", padding: "20px", borderRadius: "8px", overflowX: "auto" }}>
					<code style={{ fontSize: "0.85rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`<!DOCTYPE html>
<html>
<head>
  <title>Interactive Map Demo</title>
  <style>
    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
    .controls {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    button {
      margin: 5px;
      padding: 12px 20px;
      cursor: pointer;
      border: none;
      background: #2196F3;
      color: white;
      border-radius: 4px;
      font-size: 14px;
    }
    button:hover { background: #1976D2; }
    .map-container {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    iframe { border: 1px solid #ddd; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Interactive Map Controls Demo</h1>

  <div class="controls">
    <h3>Location Controls</h3>
    <button onclick="flyToSanFrancisco()">🌉 San Francisco</button>
    <button onclick="flyToNewYork()">🗽 New York</button>
    <button onclick="flyToLondon()">🇬🇧 London</button>
    <button onclick="flyToTokyo()">🗼 Tokyo</button>

    <h3>Zoom Controls</h3>
    <button onclick="zoomTo(15)">🔍 Close (15)</button>
    <button onclick="zoomTo(12)">🔍 Medium (12)</button>
    <button onclick="zoomTo(8)">🔍 Far (8)</button>

    <h3>View Controls</h3>
    <button onclick="fitAllMarkers()">📍 Show All Markers</button>
  </div>

  <div class="map-container">
    <h3>Map with Pin Markers</h3>
    <iframe
      id="mapFrame1"
      src="/maps/interactive?markers=-122.4194,37.7749,-74.0060,40.7128,-0.1278,51.5074,139.6917,35.6895&theme=Light&width=100%&height=500px"
      width="100%"
      height="500"
    ></iframe>
  </div>

  <div class="map-container">
    <h3>Map with Circle Markers</h3>
    <iframe
      id="mapFrame2"
      src="/maps/interactive?markers=-122.4194,37.7749,-74.0060,40.7128,-0.1278,51.5074,139.6917,35.6895&theme=Dark&width=100%&height=500px&markerStyle=circle&markerColors=FF6B6B,4ECDC4,FFE66D,A8E6CF"
      width="100%"
      height="500"
    ></iframe>
  </div>

  <script>
    const mapFrame1 = document.getElementById('mapFrame1');
    const mapFrame2 = document.getElementById('mapFrame2');
    let mapReady = false;

    // Listen for map ready event
    window.addEventListener('message', (event) => {
      if (event.data.command === 'mapReady') {
        console.log('✅ Map is ready!');
        mapReady = true;
      }
    });

    // Send command to both maps
    function sendToAllMaps(command, data) {
      if (!mapReady) {
        console.warn('⚠️ Map not ready yet');
        return;
      }
      mapFrame1.contentWindow.postMessage({ command, data }, '*');
      mapFrame2.contentWindow.postMessage({ command, data }, '*');
    }

    // Location functions
    function flyToSanFrancisco() {
      sendToAllMaps('flyTo', {
        lng: -122.4194, lat: 37.7749, zoom: 13, duration: 2000
      });
    }

    function flyToNewYork() {
      sendToAllMaps('flyTo', {
        lng: -74.0060, lat: 40.7128, zoom: 13, duration: 2000
      });
    }

    function flyToLondon() {
      sendToAllMaps('flyTo', {
        lng: -0.1278, lat: 51.5074, zoom: 13, duration: 2000
      });
    }

    function flyToTokyo() {
      sendToAllMaps('flyTo', {
        lng: 139.6917, lat: 35.6895, zoom: 13, duration: 2000
      });
    }

    // Zoom functions
    function zoomTo(level) {
      sendToAllMaps('setZoom', { zoom: level, duration: 1500 });
    }

    function fitAllMarkers() {
      sendToAllMaps('fitBounds', { padding: 80, duration: 1500 });
    }
  </script>
</body>
</html>`}
					</code>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					React Component with Controls
				</h2>
				<div style={{ backgroundColor: "#1a202c", padding: "20px", borderRadius: "8px", overflowX: "auto" }}>
					<code style={{ fontSize: "0.85rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`import { useRef, useState, useEffect } from 'react';

function ControlledMap({ coordinates, theme = "Light" }) {
  const iframeRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.command === 'mapReady') {
        setMapReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendCommand = (command, data) => {
    if (mapReady && iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({ command, data }, '*');
    }
  };

  const flyTo = (lng, lat, zoom = 13) => {
    sendCommand('flyTo', { lng, lat, zoom, duration: 2000 });
  };

  const setZoom = (zoom) => {
    sendCommand('setZoom', { zoom, duration: 1000 });
  };

  const fitAll = () => {
    sendCommand('fitBounds', { padding: 50 });
  };

  const markers = coordinates.flat().join(',');
  const url = \`/maps/interactive?markers=\${markers}&theme=\${theme}\`;

  return (
    <div>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <button onClick={() => flyTo(-122.4194, 37.7749)}>
          San Francisco
        </button>
        <button onClick={() => flyTo(-74.0060, 40.7128)}>
          New York
        </button>
        <button onClick={() => setZoom(15)}>Zoom In</button>
        <button onClick={() => setZoom(8)}>Zoom Out</button>
        <button onClick={fitAll}>Fit All</button>
      </div>

      <iframe
        ref={iframeRef}
        src={url}
        width="100%"
        height="600"
        style={{ border: '1px solid #ddd', borderRadius: '8px' }}
        title="Interactive Map"
      />

      {!mapReady && <p>Loading map...</p>}
    </div>
  );
}

// Usage
<ControlledMap
  coordinates={[
    [-122.4194, 37.7749],
    [-74.0060, 40.7128],
    [-0.1278, 51.5074]
  ]}
  theme="Dark"
/>`}
					</code>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Available Themes
				</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
					{["Basic", "Satellite", "Light", "Dark", "Spring", "Decimal", "Sky", "Blueprint", "Galaxy", "Old West"].map(theme => (
						<div key={theme} style={{ padding: "10px", backgroundColor: "#f7fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
							<code style={{ fontSize: "0.9rem", color: "#2d3748" }}>{theme}</code>
						</div>
					))}
				</div>
			</section>

			<footer style={{ borderTop: "2px solid #e2e8f0", paddingTop: "20px", marginTop: "40px", color: "#718096", fontSize: "0.9rem" }}>
				<p>Powered by Mapbox GL JS</p>
			</footer>
		</div>
	);
}
