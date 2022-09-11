import { useState } from "react";
import useFetch from "../hooks/useFetch";
import useInterval from "../hooks/useInterval";

const StayLiquidWidget = () => {
	const { isLoading, data } = useFetch({
		model: "Stay Liquid",
	});

	const messages = [
		{
			title: "Teamwork",
			content:
				"Ping your team members every now and then to see if they need help.",
		},
		{
			title: "Productivity",
			content:
				"Remember to stand up and stretch your legs to keep the blood flowing.",
		},
	];

	const [curIndex, setCurIndex] = useState(0);

	const completed = useInterval(() => {
		const length = data?.length ? data.length : messages.length;
		setCurIndex(curIndex === length - 1 ? 0 : curIndex + 1);
	}, 30 * 1000);

	const message = data?.length ? data[curIndex] : messages[curIndex];

	return (
		<div className="h-full flex flex-col relative">
			<svg
				className="text-blue-900/60 absolute -mr-[1px] -mt-[1px] right-2 top-2 w-[26px] -rotate-90 z-50"
				viewBox="0 0 120 120"
			>
				<circle
					cx="60"
					cy="60"
					r="54"
					fill="none"
					stroke="currentColor"
					strokeWidth="12"
					pathLength="100"
					strokeDasharray="100"
					strokeDashoffset={100 - completed}
				/>
			</svg>

			<div className="pt-5 pb-2 px-5 bg-blue-500 text-white -mb-5 z-10 relative">
				<h3 className="mt-0.5 text-lg font-bold font-serif">Stay Liquid</h3>
			</div>

			<div className="relative -mb-3">
				<svg className="rotate-6 text-blue-500 -mx-6" viewBox="0 0 1440 320">
					<path
						fill="currentColor"
						fillOpacity="1"
						strokeWidth={10}
						stroke="#a0c4ff"
						d="M0,160L30,176C60,192,120,224,180,240C240,256,300,256,360,245.3C420,235,480,213,540,186.7C600,160,660,128,720,117.3C780,107,840,117,900,128C960,139,1020,149,1080,128C1140,107,1200,53,1260,80C1320,107,1380,213,1410,266.7L1440,320L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z"
					/>
				</svg>
			</div>

			<div className="px-5 pb-5 flex flex-1 w-full">
				<div>
					<small className="inline-block mb-1 text-blue-500 text-xs font-semibold uppercase tracking-wide">
						{message.title}
					</small>
					<p className="text-sm">{message.content}</p>
				</div>
			</div>
		</div>
	);
};

StayLiquidWidget.props = {
	noPadding: true,
	icon: (
		<div className="bg-white w-full h-full rounded-full flex items-center justify-center">
			<svg className="w-10 ml-0.5 mt-1" viewBox="0 0 332 412">
				<defs>
					<radialGradient id="rg" r="1" fx="0.25" fy="0.5">
						<stop offset="0%" stopColor="white"></stop>
						<stop offset="75%" stopColor="#1B7FE4"></stop>
					</radialGradient>
				</defs>
				<path
					id="pathX"
					fill="url(#rg)"
					d="m 228.82,126.17 c 0,0 -11.21426,-24.27631 -54.17763,-36.049322 -6.26889,-1.717829 -34.05856,-0.314692 -40.44915,0.872881 C 106.06884,96.219957 84.38,126.17 84.38,126.17 c -43.19,59.62 0.65,142 74,141.33 71.09,-1.56 113.12,-82.46 70.47,-141.33"
				>
					<animate
						attributeName="d"
						begin="0s"
						dur="4s"
						repeatCount="indefinite"
						values="
	m 228.82,126.17 c 0,0 -11.21426,-24.27631 -54.17763,-36.049322 -6.26889,-1.717829 -34.05856,-0.314692 -40.44915,0.872881 C 106.06884,96.219957 84.38,126.17 84.38,126.17 c -43.19,59.62 0.65,142 74,141.33 71.09,-1.56 113.12,-82.46 70.47,-141.33;
	
	m 228.82,126.17 c 0,0 -36.96426,-56.572924 -62.47,-86.24 -4.23749,-4.928853 -15.48617,-5.112646 -19.5,0 -21.57777,27.484873 -62.47,86.24 -62.47,86.24 -43.19,59.62 0.65,142 74,141.33 71.09,-1.56 113.12,-82.46 70.47,-141.33;
	m 228.82,126.17 c 0,0 -11.21426,-24.27631 -54.17763,-36.049322 -6.26889,-1.717829 -34.05856,-0.314692 -40.44915,0.872881 C 106.06884,96.219957 84.38,126.17 84.38,126.17 c -43.19,59.62 0.65,142 74,141.33 71.09,-1.56 113.12,-82.46 70.47,-141.33;
	"
					/>
				</path>
			</svg>
		</div>
	),
};

export default StayLiquidWidget;
