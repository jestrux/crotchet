import { RequestInfo } from "rwsdk/worker";

export function Home({ ctx }: RequestInfo) {
	// if (!import.meta.env.VITE_IS_DEV_SERVER) return <div>Hello World</div>;
	return <div>Hello World</div>;
}
