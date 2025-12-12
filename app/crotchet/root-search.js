import { sourceGet } from "@/crotchet";
import { objectIsEmpty } from "@/crotchet/utils";

/**
 * Searches through actions with context="search" and their associated sources,
 * appending results asynchronously via the appendResult callback.
 *
 * @param {string} searchQuery - The search query to process
 * @param {function} appendResult - Callback to append results asynchronously
 * @param {object} options - Optional configuration
 * @param {function} options.isCancelled - Function that returns true if search should be cancelled
 * @returns {function} Cancel function to abort the search
 */
export const searchActionResults = _.throttle((searchQuery, appendResult, options = {}) => {
	// console.log('[searchActionResults] Called with query:', searchQuery);

	const { isCancelled = () => false } = options;

	const searchActions = Object.entries(window.actions ?? {}).reduce(
		(agg, [name, action]) => {
			if (action.context != "search") return agg;

			return [
				...agg,
				{
					name,
					...action,
				},
			];
		},
		[]
	);

	// console.log('[searchActionResults] Found search actions:', searchActions.length, searchActions.map(a => a.name));

	searchActions.forEach((action) => {
		if (action.source) {
			// console.log('[searchActionResults] Processing action:', action.name, 'with source:', action.source);

			let source = action.source;
			if (typeof source == "string") source = window.dataSources[source];

			sourceGet(source, {
				searchQuery,
				first: true,
				cacheKey: `${source.name}/search`,
				// cacheDuration: yearInSeconds(),
				// invalidateCache: true,
			}).then((res) => {
				// Check if cancelled before appending
				if (isCancelled()) {
					// console.log('[searchActionResults] Search cancelled, ignoring result for:', action.name);
					return null;
				}

				if (!res) {
					// console.log('[searchActionResults] No result from sourceGet for action:', action.name);
					return null;
				}

				// console.log('[searchActionResults] Got result from sourceGet for action:', action.name, res);

				const { image, poster, video, ...result } = res;

				result.leading = action.icon || window.UI.icon("search");
				result.trailing = source.label;
				result.source = source.name;
				result.media = {image, poster, video};
				result.__searchKey = action._id;

				if (!objectIsEmpty({ image: poster || image, video })) {
					result.preview = () => {
						return window.UI.previewWithMeta({
							data: {
								...result,
								image: poster || image,
								video,
								layout: "portrait",
							},
						});
					};
				}

				// console.log('[searchActionResults] Calling appendResult with:', result);
				appendResult(result);
			});
		}
	});
}, 300);
