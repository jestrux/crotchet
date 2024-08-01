import { forwardRef } from "react";

export default forwardRef(function PageButton(
	{ as, className, ...props },
	ref
) {
	var allProps = {
		className: `flex items-center gap-1 relative cursor-default rounded-md h-9 pl-2 focus:outline-none focus-visible:border-content/20 text-xs font-medium ${className}`,
		ref: ref,
		...props,
	};

	if (as) return <div {...allProps}></div>;

	return <button {...allProps} />;
});
