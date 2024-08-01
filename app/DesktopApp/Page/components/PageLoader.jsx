export default function PageLoader() {
	return (
		<div className="relative h-px">
			<style>
				{
					/*css*/ `
				.progress-bar-short,
				.progress-bar-long {
					animation-duration: 2.2s;
					animation-iteration-count: infinite;
					animation-delay: 200ms;
					will-change: left, right;
				}

				.progress-bar-short {
					left: 0%;
					right: 100%;
					top: 0;
					bottom: 0;
					position: absolute;
					animation-name: indeterminate-short-ltr;
				}

				.progress-bar-long {
					left: 0%;
					right: 100%;
					top: 0;
					bottom: 0;
					position: absolute;
					animation-name: indeterminate-ltr;
				}

				@keyframes indeterminate-ltr {
					0% {
						left: -90%;
						right: 100%;
					}
					60% {
						left: -90%;
						right: 100%;
					}
					100% {
						left: 100%;
						right: -35%;
					}
				}

				@keyframes indeterminate-short-ltr {
					0% {
						left: -200%;
						right: 100%;
					}
					60% {
						left: 107%;
						right: -8%;
					}
					100% {
						left: 107%;
						right: -8%;
					}
				}
			`
				}
			</style>

			<div>
				<div className="progress-bar-long bg-gradient-to-r from-transparent via-green-500 to-blue-500"></div>
				<div className="progress-bar-short bg-gradient-to-r from-transparent via-pink-500 to-green-500"></div>
			</div>
		</div>
	);
}
