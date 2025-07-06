import { registerAction } from "@/crotchet";

export default function codeScreenshot() {
	const icon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
			/>
		</svg>
	);

	registerAction("codeImage", {
		label: "Code Image",
		global: true,
		desktopOnly: true,
		// context: "share",
		icon,
		// match: ({ text, url, image, file } = {}) =>
		// 	Object.values(cleanObject({ text, url, image, file })).length,
		handler: () => {
			window.openPage({
				title: "Code to Screenshot",
				resolve: async () => {
					const res = await window.readClipboard();
					// console.log("Res: ", res);
					const code =
						res.value ||
						`
						registerAction("clipboard", {
							global: true,
							color: "#2498F5",
							icon: (
								<svg fill="currentColor" viewBox="0 0 16 16">
									<path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
									<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708" />
								</svg>
							),
						});
					`;

					return {
						code,
						theme: "default",
						lineNumbers: true,
						language: "javascript",
					};
				},
				preview: ({ pageData, pageResolving }) => {
					if (!pageData || pageResolving) return null;

					return window.UI.component({
						content: `<div 
							class="absolute inset-0 sbg-black stext-white sp-3 soverflow-auto"
							x-data="{
								updateEditor(data) {
									this.editor.getDoc().setValue(data.code);
									this.editor.setOption('lineNumbers', data.lineNumbers);
									this.editor.setOption('theme', data.theme || 'default');
									this.editor.setOption('mode', data.language || 'javascript');
								},
								init() {
									this.code = this.$pageData.code;
									this.$onPageDataChanged((data) => {
										this.updateEditor(data);
									});
									
									setTimeout(() => {
										this.editor = window.CodeMirror.fromTextArea(
											this.$refs.textarea,
										);
										this.editor.setSize('auto', 'auto');
										this.updateEditor(this.$pageData);
									});
								}
							}"
						>
							<textarea 
								x-ref="textarea" 
								x-model="code"
							></textarea>
						</div>`,
					});
				},
				// type: "detail",
				type: "form",
				fields: {
					// code: { label: "", type: "contentEditable" },
					language: {
						type: "choice",
						choices: [
							{ label: "JavaScript", value: "javascript" },
							{ label: "HTML", value: "htmlmixed" },
							{ label: "CSS", value: "css" },
						],
					},
					theme: {
						type: "choice",
						choices: [
							{ label: "Bongzilla", value: "bongzilla" },
							{ label: "Default", value: "default" },
						],
					},
					lineNumbers: "boolean",
				},
				// noPadding: true,
				// fullWidth: true,
				actions: [
					{
						label: "Copy",
						handler: async () => {
							const dataUrl = await window.domtoimage.toPng(
								document.querySelector(".CodeMirror")
							);

							return window.copyImage(dataUrl);
						},
					},
				],
				action: {
					label: "Download",
					loadingMessage: "Downloading...",
					successMessage: "Downloaded",
					handler: async () => {
						const dataUrl = await window.domtoimage.toPng(
							document.querySelector(".CodeMirror")
						);

						return window.exportContent(
							dataUrl,
							window.randomId("code-screenshot"),
							"png"
						);
					},
				},
				externalAssets: [
					// {
					// 	type: "script",
					// 	name: "hljs",
					// 	url: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js",
					// },
					// {
					// 	type: "css",
					// 	name: "hljs-default-theme",
					// 	url: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css",
					// },
					// {
					// 	type: "script",
					// 	name: "hljs-javascript",
					// 	url: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/javascript.min.js",
					// },
					{
						type: "script",
						name: "domToImage",
						url: "https://www.unpkg.com/dom-to-image@2.6.0/dist/dom-to-image.min.js",
					},
					{
						type: "script",
						name: "codemirror",
						url: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/codemirror.js",
					},
					{
						type: "css",
						name: "codemirror-css",
						url: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/codemirror.css",
					},
					{
						type: "css",
						name: "codemirror-theme-bongzilla",
						url: "https://cdn.jsdelivr.net/npm/code-mirror-themes@1.0.0/themes/bongzilla.min.css",
					},
					{
						type: "script",
						name: "codemirror-mode-js",
						url: "https://raw.githubusercontent.com/codemirror/codemirror5/master/mode/javascript/javascript.js",
					},
					{
						type: "script",
						name: "codemirror-mode-css",
						url: "https://raw.githubusercontent.com/codemirror/codemirror5/master/mode/css/css.js",
					},
					{
						type: "script",
						name: "codemirror-mode-html",
						url: "https://raw.githubusercontent.com/codemirror/codemirror5/master/mode/htmlmixed/htmlmixed.js",
					},
				],
			});
		},
	});
}
