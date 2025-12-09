import { RequestInfo } from "rwsdk/worker";

export function DbDocs({ ctx }: RequestInfo) {
	return (
		<div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6" }}>
			<header style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "20px", marginBottom: "40px" }}>
				<h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "10px", color: "#1a202c" }}>
					🗄️ Database API
				</h1>
				<p style={{ fontSize: "1.1rem", color: "#4a5568" }}>
					RESTful Firestore database API with in-memory filtering and search
				</p>
			</header>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Endpoints Overview
				</h2>
				<div style={{ marginBottom: "15px" }}>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							GET /db/:table
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Query documents with filtering, search, and sorting
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							GET /db/:table/:rowId
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Get a single document by ID
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							POST /db/:table
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Insert a new document
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							PUT /db/:table/:rowId
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Update a document by ID
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							DELETE /db/:table/:rowId
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Delete a document by ID
						</p>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #3b82f6", paddingBottom: "10px" }}>
					GET /db/:table - Query Documents
				</h2>

				<div style={{ backgroundColor: "#e0f2fe", padding: "20px", borderRadius: "8px", border: "1px solid #7dd3fc", marginBottom: "20px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#0c4a6e", marginBottom: "10px" }}>
						✨ No Firebase Indexes Required
					</h4>
					<p style={{ color: "#0c4a6e", marginBottom: "0" }}>
						All filtering, sorting, and searching is done in-memory after fetching. This means you can filter on any field combination without creating Firestore composite indexes!
					</p>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Query Parameters
				</h3>

				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem", marginBottom: "30px" }}>
					<thead>
						<tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #cbd5e0" }}>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Parameter</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Type</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>rowId</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Get single document by ID</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>filters[key]</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Filter documents (supports multiple). Works with arrays!</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>orderBy</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Sort results (format: "field,direction")</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>limit</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>number</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Maximum number of results</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>first</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Return first document only</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>random</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Return random document only</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>shuffle</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Shuffle all results</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>searchQuery</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Search term (ranked by relevance)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>searchFields</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Comma-separated fields to search (default: title,subtitle,tags,name,description)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>searchable</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>boolean</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Enable/disable search (default: true)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>fieldMap[key]</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>string</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Map/rename fields in response</td>
						</tr>
					</tbody>
				</table>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Examples
				</h3>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Get All Documents
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Get Single Document by ID
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/users/abc123`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Filter Documents
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts?filters[status]=active&filters[category]=tech`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Search & Filter
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts?filters[status]=published&searchQuery=react&searchFields=title,tags`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Sort & Limit
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts?orderBy=createdAt,desc&limit=10`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Get Random Document
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "10px" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts?random=true`}
						</code>
					</div>
					<p style={{ color: "#4a5568", fontSize: "0.9rem" }}>Returns a single random document</p>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Shuffle Results
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "10px" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts?shuffle=true&limit=5`}
						</code>
					</div>
					<p style={{ color: "#4a5568", fontSize: "0.9rem" }}>Returns 5 documents in random order</p>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Complex Query
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
							{`GET /db/posts?filters[status]=active&filters[category]=tech&searchQuery=javascript&orderBy=createdAt,desc&limit=10`}
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #10b981", paddingBottom: "10px" }}>
					POST /db/:table - Insert Document
				</h2>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Request Body
				</h3>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "20px" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`{
  "data": {
    "title": "My Post",
    "content": "Hello world",
    "tags": ["javascript", "tutorial"]
  },
  "rowId": "custom-id",  // Optional
  "merge": true          // Optional
}`}
					</code>
				</div>

				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem", marginBottom: "30px" }}>
					<thead>
						<tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #cbd5e0" }}>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Field</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Required</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>data</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Yes</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Document data to insert. createdAt and updatedAt added automatically.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>rowId</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>No</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Custom document ID. Auto-generated if not provided.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>merge</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>No</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>If rowId exists, merge with existing data (default: true)</td>
						</tr>
					</tbody>
				</table>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Example
				</h3>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`fetch('/db/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      title: 'Getting Started with React',
      content: 'React is a JavaScript library...',
      tags: ['react', 'tutorial'],
      status: 'published'
    }
  })
})`}
					</code>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #f59e0b", paddingBottom: "10px" }}>
					PUT - Update Document
				</h2>

				<p style={{ color: "#4a5568", marginBottom: "20px" }}>
					Two ways to update a document: with rowId in the URL path or in the request body.
				</p>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Method 1: PUT /db/:table/:rowId (Recommended)
				</h3>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "20px" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`{
  "data": {
    "status": "published",
    "views": 150
  },
  "merge": true  // Optional, defaults to true
}`}
					</code>
				</div>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "30px" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`fetch('/db/posts/abc123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      status: 'published',
      publishedAt: new Date().toISOString()
    }
  })
})`}
					</code>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Method 2: PUT /db/:table
				</h3>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "20px" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`{
  "rowId": "abc123",
  "data": {
    "status": "published",
    "views": 150
  },
  "merge": true  // Optional, defaults to true
}`}
					</code>
				</div>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "30px" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`fetch('/db/posts', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rowId: 'abc123',
    data: {
      status: 'published',
      publishedAt: new Date().toISOString()
    }
  })
})`}
					</code>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Request Body Fields
				</h3>

				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem", marginBottom: "30px" }}>
					<thead>
						<tr style={{ backgroundColor: "#f7fafc", borderBottom: "2px solid #cbd5e0" }}>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Field</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Required</th>
							<th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#2d3748" }}>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>rowId</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Only for Method 2</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>ID of document to update (use path param in Method 1)</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>data</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Yes</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Fields to update. updatedAt set automatically.</td>
						</tr>
						<tr style={{ borderBottom: "1px solid #e2e8f0" }}>
							<td style={{ padding: "12px", fontWeight: "500" }}>merge</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>No</td>
							<td style={{ padding: "12px", color: "#4a5568" }}>Merge with existing data (default: true). Set false to replace.</td>
						</tr>
					</tbody>
				</table>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", borderBottom: "3px solid #ef4444", paddingBottom: "10px" }}>
					DELETE /db/:table/:rowId - Delete Document
				</h2>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Example
				</h3>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto", marginBottom: "15px" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
						{`DELETE /db/posts/abc123`}
					</code>
				</div>

				<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
					<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`fetch('/db/posts/abc123', {
  method: 'DELETE'
})`}
					</code>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Storage Endpoints
				</h2>
				<p style={{ color: "#4a5568", marginBottom: "20px" }}>
					Upload files to Firebase Storage
				</p>

				<div style={{ marginBottom: "15px" }}>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							POST /storage/upload-raw-string
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Upload raw string content as a file
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "10px" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							POST /storage/upload-string-as-file
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Upload string as file with content type
						</p>
					</div>
					<div style={{ backgroundColor: "#f7fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
						<code style={{ fontSize: "1rem", color: "#2d3748", fontWeight: "600" }}>
							POST /storage/upload-data-url
						</code>
						<p style={{ color: "#4a5568", marginTop: "8px", marginBottom: "0" }}>
							Upload base64 data URL (e.g., from canvas)
						</p>
					</div>
				</div>

				<h3 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px", marginTop: "30px" }}>
					Examples
				</h3>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Upload String
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`fetch('/storage/upload-raw-string', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Hello, World!',
    name: 'hello.txt',
    type: 'text/plain'
  })
})`}
						</code>
					</div>
				</div>

				<div style={{ marginBottom: "30px" }}>
					<h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2d3748", marginBottom: "10px" }}>
						Upload Data URL (Canvas/Image)
					</h4>
					<div style={{ backgroundColor: "#1a202c", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
						<code style={{ fontSize: "0.9rem", color: "#68d391", whiteSpace: "pre", display: "block" }}>
{`const canvas = document.createElement('canvas');
// ... draw on canvas ...
const dataUrl = canvas.toDataURL('image/png');

fetch('/storage/upload-data-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dataUrl })
})`}
						</code>
					</div>
				</div>
			</section>

			<section style={{ marginBottom: "40px" }}>
				<h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#2d3748", marginBottom: "15px" }}>
					Features
				</h2>

				<div style={{ backgroundColor: "#f0fdf4", padding: "20px", borderRadius: "8px", border: "1px solid #86efac", marginBottom: "15px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#14532d", marginBottom: "10px" }}>
						✨ Smart Filtering
					</h4>
					<ul style={{ color: "#14532d", marginLeft: "20px", marginBottom: "0" }}>
						<li style={{ marginBottom: "8px" }}>Works with array fields - checks if any element matches</li>
						<li style={{ marginBottom: "8px" }}>Case-insensitive matching</li>
						<li style={{ marginBottom: "8px" }}>Ignores whitespace differences</li>
						<li style={{ marginBottom: "0" }}>Multiple filters with AND logic</li>
					</ul>
				</div>

				<div style={{ backgroundColor: "#e0f2fe", padding: "20px", borderRadius: "8px", border: "1px solid #7dd3fc", marginBottom: "15px" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#0c4a6e", marginBottom: "10px" }}>
						🔍 Ranked Search
					</h4>
					<ul style={{ color: "#0c4a6e", marginLeft: "20px", marginBottom: "0" }}>
						<li style={{ marginBottom: "8px" }}>Exact match: Score 10</li>
						<li style={{ marginBottom: "8px" }}>Starts with: Score 5</li>
						<li style={{ marginBottom: "8px" }}>Contains: Score 1</li>
						<li style={{ marginBottom: "0" }}>Results sorted by relevance</li>
					</ul>
				</div>

				<div style={{ backgroundColor: "#fef3c7", padding: "20px", borderRadius: "8px", border: "1px solid #fcd34d" }}>
					<h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#78350f", marginBottom: "10px" }}>
						⚡ Performance
					</h4>
					<ul style={{ color: "#78350f", marginLeft: "20px", marginBottom: "0" }}>
						<li style={{ marginBottom: "8px" }}>No Firebase indexes required</li>
						<li style={{ marginBottom: "8px" }}>Filter on any field combination</li>
						<li style={{ marginBottom: "8px" }}>In-memory sorting and filtering</li>
						<li style={{ marginBottom: "0" }}>Automatic timestamps (createdAt, updatedAt)</li>
					</ul>
				</div>
			</section>

			<footer style={{ borderTop: "2px solid #e2e8f0", paddingTop: "20px", marginTop: "40px", color: "#718096", fontSize: "0.9rem" }}>
				<p>Powered by Firestore REST API</p>
			</footer>
		</div>
	);
}
