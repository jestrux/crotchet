import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";

const _get = function (o, s) {
	if (!o || !s) return null;

	s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
	s = s.replace(/^\./, ""); // strip a leading dot
	var a = s.split(".");
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
		} else {
			return;
		}
	}
	return o;
};

const ListWidget = ({ widget }) => {
	const { isLoading, data } = useFetch({
		model: widget.model,
	});
	let props;
	try {
		props = JSON.parse(widget.props);
	} catch (error) {
		props = widget.props;
	}

	// return data && console.log(`${widget.name} data: `, data, props.title, props.subtitle);

	return (
		<div>
			{isLoading ? (
				<div className="relative h-8">
					<Loader size={25} />
				</div>
			) : (
				<div className="space-y-3 pb-2">
					{data.map((entry, index) => {
						const image = _get(entry, props.image);
						const title = _get(entry, props.title);
						const subtitle = _get(entry, props.subtitle);
						const leading = _get(entry, props.leading);

						return (
							<div key={index} className="flex items-center">
								{image?.length && (
									<img
										className="mr-2 flex-shrink-0 border rounded-full w-8 h-8 object-cover"
										src={image}
										alt=""
									/>
								)}

								<div className="flex-1 mr-3 min-w-0">
									<h5 className="text-sm font-semibold mb-0.5">
										{title}
									</h5>
									{subtitle?.length && (
										<p className="text-sm opacity-60">
											{subtitle}
										</p>
									)}
								</div>

								<div className="flex-shrink-0 ml-auto">
									{leading?.length && (
										<span className="text-sm opacity-60">
											{leading}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ListWidget;
