// Utils
declare var _: any;

declare var moment: (...any) => any;

declare var openUrl: (path: String) => Promise<any>;

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
				icon?: String;
				label?: String | undefined;
				context?: "share" | undefined;
				global?: boolean | undefined;
				mobileOnly?: boolean | undefined;
				desktopOnly?: boolean | undefined;
				match?: (payload: any) => boolean | null | undefined;
				handler?: (payload: any) => PromiseLike<any>;
				url?: String | undefined;
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
