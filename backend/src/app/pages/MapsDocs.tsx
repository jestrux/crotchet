import { RequestInfo } from "rwsdk/worker";
import { MapsDocsNav } from "@/app/components/MapsDocsNav";

export function MapsDocs({ ctx }: RequestInfo) {
	return (
		<div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6" }}>
			<header style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "20px", marginBottom: "40px" }}>
				<h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "10px", color: "#1a202c" }}>
					📍 Static Maps API
				</h1>
				<p style={{ fontSize: "1.1rem", color: "#4a5568" }}>
					Generate static map images with custom paths and markers
				</p>
			</header>

			<MapsDocsNav currentPage="static" />

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Endpoints
				</h2>
				<div style={{ marginBottom: "15px" }}>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							GET /maps/path
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Generate a map with a path connecting multiple coordinates
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							GET /maps/plot
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Generate a map with markers at multiple coordinates (no path)
						</p>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #3b82f6", paddingBottom: "10px" }}>
					📍 /maps/path - Path with Markers
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "20px" }}>
					Creates a map with a visible path connecting multiple coordinates, with optional markers at each point.
				</p>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Parameters
				</h3>

				<div style={{ marginBottom: "25px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						<span style={{ backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "4px", fontSize: "0.9rem", fontWeight: "700" }}>
							REQUIRED
						</span>{" "}
						coordinates
					</h3>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						JSON array of [longitude, latitude] pairs. Must contain at least 2 coordinates.
					</p>
					<div style={{ backgroundColor: "#f7fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
						<code style={{ fontSize: "0.95rem", color: "#2d3748" }}>
							[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145]]
						</code>
					</div>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", marginTop: "30px" }}>
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
							<td style={{ padding: "12px", color: "#4a5568" }}>Map theme (see themes below)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>width</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>800</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Image width in pixels (max 1280)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>height</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>800</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Image height in pixels (max 1280)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>lineColor</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>55FF33</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Path line color (hex, no #)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>lineWidth</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>6</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Path line width (4-10)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markers</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px" }}><code>true</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Show markers (set to "false" to hide)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerColor</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>hash-based</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Marker color (hex, no #). If not provided, each marker gets a unique color based on coordinate hash</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerIcon</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>circle</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Marker icon name</td>
						</tr>
					</tbody>
				</table>
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

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Response
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "10px" }}>
					Returns a PNG image binary with the following headers:
				</p>
				<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
					<code style={{ fontSize: "0.95rem", color: "#2d3748", display: "block", marginBottom: "5px" }}>
						Content-Type: image/png
					</code>
					<code style={{ fontSize: "0.95rem", color: "#2d3748", display: "block" }}>
						Access-Control-Allow-Origin: *
					</code>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Examples
				</h2>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Basic Usage (with hash-based marker colors)
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/path?coordinates=[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145]]`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Custom Styling
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/path?coordinates=[[-73.935242,40.730610],[-74.006,40.7128]]&theme=Dark&width=1000&height=600&lineColor=00FF00&lineWidth=8`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Single Marker Color
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/path?coordinates=[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145]]&markerColor=FF0000`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						No Markers
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/path?coordinates=[[-73.935242,40.730610],[-74.006,40.7128]]&markers=false`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Using in HTML
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`<img
  src="/maps/path?coordinates=[[-73.935242,40.730610],[-74.006,40.7128]]&theme=Dark"
  alt="Map with path"
/>`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Using with JavaScript
					</h3>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`const coordinates = [
  [-73.935242, 40.730610],
  [-74.006, 40.7128],
  [-71.057083, 42.361145]
];

const params = new URLSearchParams({
  coordinates: JSON.stringify(coordinates),
  theme: 'Dark',
  width: '1000',
  height: '600'
});

const imageUrl = \`/maps/path?\${params}\`;`}
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #10b981", paddingBottom: "10px" }}>
					📌 /maps/plot - Markers Only
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "20px" }}>
					Creates a map with markers at specified coordinates without any connecting path. Perfect for plotting multiple locations.
				</p>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Parameters
				</h3>

				<div style={{ marginBottom: "25px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						<span style={{ backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "4px", fontSize: "0.9rem", fontWeight: "700" }}>
							REQUIRED
						</span>{" "}
						coordinates
					</h4>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						JSON array of [longitude, latitude] pairs. Must contain at least 1 coordinate.
					</p>
					<div style={{ backgroundColor: "#f7fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
						<code style={{ fontSize: "0.95rem", color: "#2d3748" }}>
							[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145]]
						</code>
					</div>
				</div>

				<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", marginTop: "30px" }}>
					Optional Parameters
				</h4>

				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem", marginBottom: "30px" }}>
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
							<td style={{ padding: "12px", color: "#4a5568" }}>Map theme (see themes below)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>width</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>800</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Image width in pixels (max 1280)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>height</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>800</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Image height in pixels (max 1280)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerColor</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>hash-based</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Single color for all markers (hex, no #). Falls back to hash-based if not provided.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerColors</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>array</td>
							<td style={{ padding: "12px" }}><code>-</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Array of colors (hex, no #) for each marker. Uses modulus to cycle if shorter than coordinates. Takes priority over markerColor.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>markerIcon</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px" }}><code>circle</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Marker icon name</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>zoomLevel</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px" }}><code>auto</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Zoom level (1-20). Auto-fits if not specified.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>autoFit</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px" }}><code>true</code></td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Auto-fit map to show all markers. Set to "false" to use manual zoom.</td>
						</tr>
					</tbody>
				</table>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Examples
				</h3>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Basic Plot (hash-based colors)
					</h4>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						No color parameters - each marker gets a unique color based on its coordinates
					</p>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/plot?coordinates=[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145]]`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Single Color for All Markers
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/plot?coordinates=[[-73.935242,40.730610],[-74.006,40.7128]]&markerColor=3B82F6&theme=Dark`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Individual Colors per Marker
					</h4>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						Specify exact colors for each marker
					</p>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/plot?coordinates=[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145]]&markerColors=["FF0000","00FF00","0000FF"]`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Color Palette (using modulus)
					</h4>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						Provide fewer colors than coordinates - cycles through the palette
					</p>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/plot?coordinates=[[-73.935242,40.730610],[-74.006,40.7128],[-71.057083,42.361145],[-70.25,41.85],[-72.5,42.1]]&markerColors=["FF6B6B","4ECDC4","45B7D1"]`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Manual Zoom Level
					</h4>
					<p style={{ color: "#4a5568", marginBottom: "10px" }}>
						When using manual zoom, the map centers on the first coordinate
					</p>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`/maps/plot?coordinates=[[-73.935242,40.730610],[-74.006,40.7128]]&zoomLevel=10&autoFit=false`}
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Marker Color Options
				</h2>

				<div style={{ backgroundColor: "#e0f2fe", padding: "20px", borderRadius: "8px", border: "1px solid #7dd3fc", marginBottom: "20px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#0c4a6e", marginBottom: "10px" }}>
						Three-Tier Color System (plot endpoint)
					</h4>
					<p style={{ color: "#0c4a6e", marginBottom: "10px" }}>
						The <code style={{ backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" }}>/maps/plot</code> endpoint uses a priority-based color system:
					</p>
					<ol style={{ color: "#0c4a6e", marginLeft: "20px", marginBottom: "0" }}>
						<li style={{ marginBottom: "8px" }}>
							<strong>markerColors array</strong> - Individual colors per marker (uses modulus to cycle if shorter)
						</li>
						<li style={{ marginBottom: "8px" }}>
							<strong>markerColor single value</strong> - Same color for all markers
						</li>
						<li style={{ marginBottom: "0" }}>
							<strong>Hash-based colors</strong> - Automatic unique colors generated from coordinates
						</li>
					</ol>
				</div>

				<div style={{ backgroundColor: "#f0fdf4", padding: "20px", borderRadius: "8px", border: "1px solid #86efac", marginBottom: "20px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#14532d", marginBottom: "10px" }}>
						Hash-Based Colors (path & plot)
					</h4>
					<p style={{ color: "#14532d", marginBottom: "10px" }}>
						When no color parameters are provided, both endpoints automatically generate unique colors for each marker based on its coordinate position.
					</p>
					<p style={{ color: "#14532d", marginBottom: "0" }}>
						<strong>Path endpoint:</strong> Only uses hash-based when <code style={{ backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" }}>markerColor</code> is omitted.<br/>
						<strong>Plot endpoint:</strong> Falls back to hash-based if neither <code style={{ backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" }}>markerColors</code> nor <code style={{ backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" }}>markerColor</code> is provided.
					</p>
				</div>
				<div style={{ backgroundColor: "#edf2f7", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e0" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						How it works:
					</h4>
					<ul style={{ color: "#4a5568", marginLeft: "20px", marginBottom: "0" }}>
						<li style={{ marginBottom: "8px" }}>Each coordinate is converted to a string and hashed</li>
						<li style={{ marginBottom: "8px" }}>The hash is used to generate an HSL color with high saturation (70-100%) and medium lightness (45-60%)</li>
						<li style={{ marginBottom: "8px" }}>Same coordinates always produce the same color</li>
						<li style={{ marginBottom: "8px" }}>Different coordinates produce different, vibrant, and visible colors</li>
					</ul>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Caching
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "15px" }}>
					Both endpoints automatically cache generated images for improved performance and reduced API costs.
				</p>
				<div style={{ backgroundColor: "#f0fdf4", padding: "20px", borderRadius: "8px", border: "1px solid #86efac" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#14532d", marginBottom: "10px" }}>
						How Caching Works:
					</h4>
					<ul style={{ color: "#14532d", marginLeft: "20px", marginBottom: "15px" }}>
						<li style={{ marginBottom: "8px" }}>
							Each unique combination of parameters generates a unique cache key
						</li>
						<li style={{ marginBottom: "8px" }}>
							Images are cached for 7 days
						</li>
						<li style={{ marginBottom: "8px" }}>
							Subsequent requests with identical parameters return cached images instantly
						</li>
						<li style={{ marginBottom: "8px" }}>
							Cache status is indicated by the <code style={{ backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" }}>X-Cache</code> response header
						</li>
					</ul>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#14532d", marginBottom: "10px" }}>
						Cache Headers:
					</h4>
					<div style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #d1fae5" }}>
						<code style={{ fontSize: "0.9rem", color: "#14532d", display: "block", marginBottom: "5px" }}>
							X-Cache: HIT  // Image served from cache
						</code>
						<code style={{ fontSize: "0.9rem", color: "#14532d", display: "block" }}>
							X-Cache: MISS // Image freshly generated
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Error Handling
				</h2>
				<div style={{ backgroundColor: "#fff5f5", padding: "20px", borderRadius: "8px", border: "1px solid #feb2b2" }}>
					<p style={{ color: "#742a2a", marginBottom: "10px", fontWeight: "600" }}>
						Common Errors:
					</p>
					<ul style={{ color: "#742a2a", marginLeft: "20px" }}>
						<li style={{ marginBottom: "8px" }}>
							<strong>400 Bad Request:</strong> Missing or invalid coordinates parameter
						</li>
						<li style={{ marginBottom: "8px" }}>
							<strong>400 Bad Request:</strong> Coordinates array has fewer than 2 elements (path endpoint)
						</li>
						<li style={{ marginBottom: "8px" }}>
							<strong>400 Bad Request:</strong> Coordinates array is empty (plot endpoint)
						</li>
						<li style={{ marginBottom: "8px" }}>
							<strong>400 Bad Request:</strong> Invalid coordinate format (must be [lng, lat] numbers)
						</li>
						<li style={{ marginBottom: "0" }}>
							<strong>500 Internal Server Error:</strong> Failed to generate map image (check Mapbox API key)
						</li>
					</ul>
				</div>
			</section>

			<footer style={{ borderTop: "2px solid #e2e8f0", paddingTop: "20px", marginTop: "40px", color: "#718096", fontSize: "0.9rem" }}>
				<p>Powered by Mapbox Static Images API</p>
			</footer>
		</div>
	);
}
