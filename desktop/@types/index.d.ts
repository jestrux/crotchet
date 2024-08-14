// Utils
declare var _: any;

declare var moment: (...any) => any;

declare var actions: { [key: string]: any };

declare var dataSources: { [key: string]: any };

declare var openUrl: (path: String) => Promise<any>;

declare var onDesktop: () => boolean;

declare var toHms: (number: Number) => string | null;

declare var queryDb: (name: String) => Promise<any>;

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
		icon:
			| "share"
			| "play"
			| "user"
			| "shuffle"
			| "image"
			| "add"
			| "add-circle"
			| "search"
			| "list",
		props?: { size?: string }
	) => any;
	svg: (
		path: String,
		props?: { size?: string; opacity?: number; strokeWidth?: number }
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
declare var ChoiceItem: string | { label?: string; value: any };
declare var PageTitle: string | ((payload: { [key: string]: any }) => string);
declare var PageContent:
	| { [key: string]: any }
	| ((payload: { data: any; loading: boolean }) => {} | [])
	| string;
declare var ActionButton:
	| {
			label?: string;
			icon?: string | typeof UI.icon;
			handler?: (payload: any) => any;
	  }
	| ((payload: any) => typeof ActionButton | null | undefined);

declare var Page: {
	type?: String;
	resolve?: Function;
	title?: typeof PageTitle;
	content?: typeof PageContent;
	nav?: (typeof ActionButton)[];
	action?: typeof ActionButton;
	actions?: (typeof ActionButton)[];

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

declare var openPage: (props: typeof Page) => PromiseLike<any>;

declare var openForm: (props: typeof Page) => PromiseLike<any>;

declare var openAlertForm: (props: typeof Page) => PromiseLike<any>;

declare var openChoicePicker: (
	choices: (typeof ChoiceItem)[] | { choices: (typeof ChoiceItem)[] }
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
