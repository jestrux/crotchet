// Utils
declare var _: any;

declare var moment: (...any) => any;

declare var openUrl: (path: String) => Promise<any>;

declare var toHms: (number: Number) => string | null;

declare var queryDb: (name: String) => Promise<any>;

declare var showAlert: (
	message: String | { title: string; message: string }
) => Promise<any>;

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
	List: (payload: { data?: []; loading?: boolean }) => [];
	Icon: (
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
		size?: number
	) => any;
};

declare var withLoader: (
	action: PromiseLike<any> | Function,
	obj?: {
		successMessage?: String | Function | undefined;
		errorMessage?: String | Function | undefined;
		onChange?: (status: String, payload: any) => void | undefined;
	}
) => Promise<any>;

// Crotchet
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

declare var registerWidget: (
	name: String,
	widget: {
		shortcut?: String | undefined;
		handler?: (payload: any) => PromiseLike<any>;
		title?: String | undefined;
		icon?: String | undefined;
		actions?: [] | undefined;
		supportedSizes?: String | undefined;
		background?: String | undefined;
		color?: String | undefined;
		resolve?: (payload: any) => PromiseLike<any> | undefined;
		listenForUpdates?: ((callback: () => {}) => Function) | undefined;
		filter?: { [key: string]: any } | ((payload: any) => {}) | undefined;
		content?:
			| { [key: string]: any }
			| ((payload: { data: any; loading: boolean }) => {})
			| string
			| undefined;
		actionButton?:
			| { label: string; handler: (payload: any) => any }
			| ((payload: any) => {})
			| undefined;
		onClick?: { [key: string]: any } | undefined;
	}
) => void;

declare var openPage: (props: {
	title?: String;
	type?: String;
	data?: { [key: string]: any };
	fields?: { [key: string]: any };
}) => PromiseLike<any>;

declare var openForm: (props: {
	title?: String;
	data?: { [key: string]: any };
	fields?: { [key: string]: any };
}) => PromiseLike<any>;

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
