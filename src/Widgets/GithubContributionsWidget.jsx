import { useState } from "react";
import Loader from "../components/Loader";

const GithubContributionsWidget = () => {
	const [loading, setLoading] = useState(true);
	const [dayCount, setDayCount] = useState(90);
	const githubUsername = "jestrux";
	const dayCountMap = {
		D: 1,
		W: 7,
		M: 31,
		Q: 90,
		// Y: 365,
	};

	return (
		<div className="h-full flex flex-col">
			<div className="px-3 pt-1 pb-2">
				{Object.keys(dayCountMap).map((key, index) => (
					<div key={key} className="inline-flex items-center">
						<button
							className={`${
								dayCountMap[key] === dayCount
									? "text-blue-500"
									: "opacity-40"
							} font-bold`}
							onClick={() => {
								setLoading(true);
								setDayCount(dayCountMap[key]);
							}}
						>
							{key}
						</button>

						{index !== Object.keys(dayCountMap).length - 1 && (
							<span className="text-xl leading-none font-bold mx-2 opacity-40">
								&middot;
							</span>
						)}
					</div>
				))}
			</div>

			<div className="flex-1 relative">
				<img
					className="object-cover"
					src={`https://github-contribution-graph.ez4o.com/?username=${githubUsername}&last_n_days=${dayCount}`}
					alt=""
					onLoad={() => setLoading(false)}
				/>

				{loading && (
					<Loader
						color="black"
						size={30}
						thickness={6}
						className="mb-10"
					/>
				)}
			</div>
		</div>
	);
};

GithubContributionsWidget.props = {
	noPadding: true,
	title: "GitHub Activity",
	icon: (
		<svg fill="currentColor" className="w-3.5" viewBox="0 0 24 24">
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	),
};

export default GithubContributionsWidget;
