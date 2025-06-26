// Utils
declare var _: any;

declare var moment: (...any) => any;

declare var tinycolor: {
	(...any): any;
	readability: (color1: string, color2: string) => number;
};

declare var actions: { [key: string]: any };

declare var dataSources: { [key: string]: any };

declare var copyToClipboard: (any) => any;

declare var copyFromUrl: (url?: string) => Promise<any>;

declare var shareImage: (url?: string) => Promise<any>;

declare var someTime: (duration?: number) => Promise<any>;

declare var shuffle: (arr?: any[]) => any[] | undefined | null;

declare var random: (arr?: any[]) => any | undefined | null;

declare var randomId: (prefix?: String) => string;

declare var openUrl: (path: String) => Promise<any>;

declare var onDesktop: () => boolean;

declare var objectToQueryParams: (obj: { [key: string]: any }) => string;

declare var urlQueryParamsAsObject: (path: string) => { [key: string]: any };

declare var toHms: (number: Number) => string | null;

declare var queryDb: (
	name: String,
	options?: {
		rowId?: String | null;
	} | null
) => Promise<any>;

declare var uploadStringAsFile: (
	data: String,
	options: {
		type: "application/json" | "text/plain" | "application/octet-stream";
		name: String;
	}
) => Promise<any>;

declare var getPreference: (key: String) => Promise<string | null | undefined>;

declare var savePreference: (
	key: String,
	value: any
) => Promise<string | null | undefined>;

declare var dispatch: (event: String, payload?: any) => void;

declare var socketEmit: (event: String, payload?: any) => void;

declare var camelCaseToSentenceCase: (string: String) => string;

declare var getToken: (
	name: String,
	props?: { prompt?: boolean }
) => Promise<string | null | undefined>;

declare var saveToken: (
	key: String,
	value: any
) => Promise<string | null | undefined>;

declare var networkRequest: (
	url: String,
	props: {
		bearerToken?: string;
		secretToken?: string;
	}
) => PromiseLike<any>;

declare var showAlert: (
	message: String | { title: string; message: string }
) => Promise<any>;

declare var showActionSheetAlert: (
	message: String | { title: string; message: string }
) => Promise<any>;

declare var confirmDangerousAction: () => Promise<boolean>;

declare var dateFromString: (date: Date) => String;

declare var formatDate: (
	date: Date,
	formatting?: { month: "short"; day: "numeric"; year: "numeric" } | undefined
) => String;

declare var showToast: (...message) => Promise<any>;

declare var readClipboard: () => Promise<any>;

declare var processShareData: (
	value: any,
	type?: string,
	meta?: { [key: string]: any }
) => {
	payload: { [key: string]: any };
	preview: { [key: string]: any } | null;
} | null;

declare var sourceGet: (
	source: { handler: () => PromiseLike<any> },
	props: {
		orderBy?: String;
		single?: boolean;
		random?: boolean;
		limit?: number;
		filters?: { [key: string]: any };
	}
) => Promise<any>;

declare var readNetworkFile: (url: String) => PromiseLike<any>;

declare var scanNetwork: () => Promise<string[]>;

declare var GenericObject: { [key: string]: any };

declare var DataItem: {
	icon?: string | null;
	video?: string | null;
	image?: string | null;
	title?: string | null;
	subtitle?: string | null;
	url?: string | null;
	share?: string | null;
	actions?: (typeof ActionButton)[] | (() => (typeof ActionButton)[]);
	meta: { [key: string]: any };
	status?:
		| "success"
		| "verified"
		| "approved"
		| "completed"
		| "complete"
		| "done"
		| "true"
		| true
		| 1
		| "1"
		| null
		// Error
		| "error"
		| "blocked"
		| "0"
		| 0
		| false
		| "false"
		// Progress
		| "in progress"
		| "pending";
	trailing?: string | null;
	progress?: number | null;
	checked?: boolean | null;
	onClick?: () => {};
	onDoubleClick?: () => {};
	onHold?: () => {};
	onRemove?: () => {};
};

declare var UI: {
	component: (payload: {
		className?: string | null | (() => string | null);
		content?: string | null | (() => string | null);
		onInit?: (({ $el }) => void) | null;
		onRemoteAction?: ((GenericObject) => void) | null;
		onDestroy?: (({}) => void) | null;
	}) => [];
	media: (payload: {
		data?: typeof DataItem | null;
		loading?: boolean;
	}) => [];
	list: (payload: { data?: []; loading?: boolean }) => [];
	icon: (
		icon?:
			| "default"
			| "bolt"
			| "clear"
			| "close"
			| "copy"
			| "delete"
			| "more"
			| "home"
			| "share"
			| "play"
			| "user"
			| "shuffle"
			| "image"
			| "minus"
			| "substract"
			| "add"
			| "add-circle"
			| "search"
			| "list"
			| "open-external",
		props?: { size?: string | number; filled?: boolean }
	) => any;
	svg: (
		path: String,
		props?: {
			size?: string | number;
			opacity?: number;
			filled?: boolean;
			strokeWidth?: number;
			color?: string;
		}
	) => any;
};

declare var withLoader: (
	action: PromiseLike<any> | Function,
	obj?:
		| {
				successMessage?: String | Function | undefined;
				errorMessage?: String | Function | undefined;
				onChange?: (status: String, payload: any) => void | undefined;
		  }
		| String
) => Promise<any>;

// Crotchet
declare var ListenForUpdates:
	| ((callback: () => {}) => Function)
	| string
	| string[];
declare var ChoiceItem:
	| string
	| { icon?: string | typeof UI.icon; label?: string; value: any }
	| {
			icon?: string | typeof UI.icon;
			label?: string;
			handler: Function | PromiseLike<any>;
	  };
declare var ChoiceList:
	| (typeof ChoiceItem)[]
	| (() => PromiseLike<(typeof ChoiceItem)[]>);
declare var PageContext: {
	pageResolving?: boolean;
	pageFilter?: string;
	setPageFilter: (filter?: string) => {};
	pageData?: { [key: string]: any };
	pageTab?: string;
	closePage: (payload?: any | null | undefined) => {};
};
declare var PageTitle:
	| string
	| ((payload: typeof PageContext) => string | null | undefined);
declare var PageContent:
	| { [key: string]: any }
	| ((payload: typeof PageContext) => {} | [])
	| string;
declare var PagePreview:
	| { [key: string]: any }
	| ((payload: typeof PageContext) => {} | [])
	| string;
declare var WidgetActionContext: {
	data?: any | null;
	loading?: boolean | null;
	refetch: () => {};
	state?: { [key: string]: any };
	setState?: (key, value) => {};
};
declare var ActionButton:
	| {
			label?: string;
			icon?: string | typeof UI.icon;
			url?: string | null;
			handler?: (
				payload: typeof WidgetActionContext | any
				// | { [key: string]: any }
				// | null
				// | undefined
			) => any;
	  }
	| ((payload: any) => typeof ActionButton | null | undefined);

declare var Page: {
	listenForUpdates?: typeof ListenForUpdates;
	external?: boolean | null;
	type?: string | ((payload: typeof PageContext) => string);
	resolve?: Function;
	title?: typeof PageTitle;
	fullScreen?: boolean | ((payload: typeof PageContext) => boolean);
	condensingTitle?: boolean | ((payload: typeof PageContext) => boolean);
	placeholder?: string;
	content?: typeof PageContent;
	preview?: typeof PagePreview;
	tab?: string;
	tabs?:
		| (typeof ChoiceItem)[]
		| ((payload: typeof PageContext) => (typeof ChoiceItem)[]);
	nav?:
		| (typeof ActionButton & { page: typeof Page })[]
		| ((
				payload: typeof PageContext
		  ) => (typeof ActionButton & { page: typeof Page })[]);
	action?:
		| typeof ActionButton
		| ((payload: typeof PageContext) => typeof ActionButton);
	actions?:
		| (typeof ActionButton)[]
		| ((
				payload: typeof PageContext
		  ) => (typeof ActionButton)[] | null | undefined);
	toolbar?:
		| (typeof ActionButton & { flex: boolean })[]
		| ((
				payload: typeof PageContext
		  ) => (typeof ActionButton & { flex: boolean })[]);

	filter?: {
		field?: string;
		defaultValue?: string;
	};

	filters?: (typeof ChoiceItem)[];

	// form details
	data?: { [key: string]: any };
	fields?: { [key: string]: any };
	field?: { [key: string]: any };
};

declare var registerAction: (
	name: String,
	action:
		| Function
		| {
				shortcut?: String | undefined;
				icon?: String | undefined;
				color?: String | undefined;
				label?: String | undefined;
				context?: "share" | "shortcut" | undefined;
				global?: boolean | undefined;
				mobileOnly?: boolean | undefined;
				desktopOnly?: boolean | undefined;
				match?: (payload: any) => boolean | null | undefined;
				actions?:
					| (typeof ActionButton)[]
					| (() => (typeof ActionButton)[]);
				handler?: (payload: any) => PromiseLike<any> | void;
				url?: String | undefined;
				tags?: string[];
				section?: string | undefined;
		  }
) => void;

declare var registerPage: (name: string, props: typeof Page) => void;

declare var registerDataSource: (
	provider: String,
	name: String,
	formFields?: { [key: string]: any },
	layoutProps?: {
		layout?: String;
		aspectRatio?: String;
		meta?: { [key: string]: any };
	}
) => void;

declare var WidgetPayload: {
	loading?: boolean;
	data?: { [key: string]: any } | any;
};

declare var WidgetContent:
	| { [key: string]: any }
	| ((payload: typeof WidgetPayload) => {} | [])
	| string;

declare var registerWidget: (
	name: String,
	widget: {
		shortcut?: String | undefined;
		handler?: (payload: any) => PromiseLike<any>;
		title?:
			| String
			| ((payload: typeof WidgetPayload) => String | undefined | null);
		icon?: String | undefined;
		actions:
			| (typeof ActionButton)[]
			| ((payload: typeof WidgetPayload) => (typeof ActionButton)[])
			| any;
		supportedSizes?: String | undefined;
		background?: String | undefined;
		color?: String | undefined;
		resolve?: (payload?: any) => PromiseLike<any> | undefined;
		listenForUpdates?: typeof ListenForUpdates;
		filter?: { [key: string]: any } | ((payload: any) => {}) | undefined;
		content?: typeof WidgetContent;
		actionButton?: typeof ActionButton;
		onSwipe?: (
			payload: typeof WidgetActionContext & { direction: 1 | -1 }
		) => any;
		onClick?: { [key: string]: any } | undefined;
	}
) => void;

declare var registerSection: (
	name: String,
	section: {
		type?: "grid" | "list" | "actions" | null;
		title?: String | undefined;
		resolve?: (payload?: any) => PromiseLike<any> | undefined;
		listenForUpdates?: typeof ListenForUpdates;
		meta?: { [key: string]: any };
	}
) => void;

declare var openRootPage: (page: string) => PromiseLike<any>;

declare var closePage: () => void;

declare var openRemotePageController: (pageId: string) => void;

declare var openFloatingWindow: (props: typeof Page) => PromiseLike<any>;

declare var closeFloatingWindow: (windowId: string) => void;

declare var openPage: (props: string | typeof Page) => PromiseLike<any>;

declare var pushPage: (props: string | typeof Page) => PromiseLike<any>;

declare var openForm: (props: typeof Page) => PromiseLike<any>;

declare var openAlertForm: (props: typeof Page) => PromiseLike<any>;

declare var openChoicePicker: (
	choices:
		| typeof ChoiceList
		| {
				layout?: "list" | "grid" | "masonry";
				fullScreen?: boolean;
				noHeading?: boolean;
				dismissible?: boolean;
				inset?: boolean;
				title?: string | null;
				choices: typeof ChoiceList;
		  }
) => PromiseLike<any>;

declare var openActionSheet: (props: {
	fullScreen?: boolean | null;
	noHeading?: boolean | null;
	title?: String;
	inset?: boolean;
	payload?: { [key: string]: any };
	preview?: { [key: string]: any } | null | undefined;
	actions?: { [key: string]: any }[] | (() => void);
	children?: { [key: string]: any };
	content?:
		| { [key: string]: any }
		| ((payload: { data: any; loading: boolean }) => {})
		| string
		| undefined;
}) => PromiseLike<any>;

declare var setCrotchetApp: (appDetails: {
	name?: string;
	homePage?: string;
	colors?: {
		primary?: string;
		primaryDark?: string;
	};
}) => void;
