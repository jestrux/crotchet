// Utils
declare var _: any;

declare var moment: (...any) => any;

declare var actions: { [key: string]: any };

declare var dataSources: { [key: string]: any };

declare var openUrl: (path: String) => Promise<any>;

declare var onDesktop: () => boolean;

declare var toHms: (number: Number) => string | null;

declare var queryDb: (name: String) => Promise<any>;

declare var getPreference: (key: String) => Promise<string | null | undefined>;

declare var savePreference: (
	key: String,
	value: any
) => Promise<string | null | undefined>;

declare var dispatch: (event: String, payload?: any) => void;

declare var getToken: (name: String) => Promise<string | null | undefined>;

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
	props: { orderBy: String }
) => Promise<any>;

declare var UI: {
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
			| "list",
		props?: { size?: string | number }
	) => any;
	svg: (
		path: String,
		props?: {
			size?: string | number;
			opacity?: number;
			strokeWidth?: number;
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
	| { icon?: string | typeof UI.icon; label?: string; value: any };
declare var ChoiceList:
	| (typeof ChoiceItem)[]
	| (() => PromiseLike<(typeof ChoiceItem)[]>);
declare var PageContext: {
	pageFilter?: string;
	setPageFilter: (filter?: string) => {};
	pageData?: { [key: string]: any };
	pageTab?: string;
};
declare var PageTitle: string | ((payload: typeof PageContext) => string);
declare var PageContent:
	| { [key: string]: any }
	| ((payload: typeof PageContext) => {} | [])
	| string;
declare var ActionButton:
	| {
			label?: string;
			icon?: string | typeof UI.icon;
			handler?: (payload: any) => any;
	  }
	| ((payload: any) => typeof ActionButton | null | undefined);

declare var Page: {
	type?: string | ((payload: typeof PageContext) => string);
	resolve?: Function;
	title?: typeof PageTitle;
	condensingTitle?: boolean | ((payload: typeof PageContext) => boolean);
	content?: typeof PageContent;
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
				label?: String | undefined;
				context?: "share" | undefined;
				global?: boolean | undefined;
				mobileOnly?: boolean | undefined;
				desktopOnly?: boolean | undefined;
				match?: (payload: any) => boolean | null | undefined;
				handler?: (payload: any) => PromiseLike<any>;
				url?: String | undefined;
				tags?: string[];
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

declare var registerWidget: (
	name: String,
	widget: {
		shortcut?: String | undefined;
		handler?: (payload: any) => PromiseLike<any>;
		title?: String | undefined;
		icon?: String | undefined;
		actions?: (typeof ActionButton)[] | (() => (typeof ActionButton)[]);
		supportedSizes?: String | undefined;
		background?: String | undefined;
		color?: String | undefined;
		resolve?: (payload?: any) => PromiseLike<any> | undefined;
		listenForUpdates?: typeof ListenForUpdates;
		filter?: { [key: string]: any } | ((payload: any) => {}) | undefined;
		content?: typeof PageContent;
		actionButton?: typeof ActionButton;
		onClick?: { [key: string]: any } | undefined;
	}
) => void;

declare var openRootPage: (page: string) => PromiseLike<any>;

declare var openPage: (props: string | typeof Page) => PromiseLike<any>;

declare var pushPage: (props: string | typeof Page) => PromiseLike<any>;

declare var openForm: (props: typeof Page) => PromiseLike<any>;

declare var openAlertForm: (props: typeof Page) => PromiseLike<any>;

declare var openChoicePicker: (
	choices: typeof ChoiceList | { title?: string; choices: typeof ChoiceList }
) => PromiseLike<any>;

declare var openActionSheet: (props: {
	title?: String;
	payload?: { [key: string]: any };
	preview?: { [key: string]: any } | null | undefined;
	actions?: [{ [key: string]: any }];
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
