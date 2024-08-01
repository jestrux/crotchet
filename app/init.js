import lodash from "lodash";
import moment from "moment";
import { utils, registerAction, globalActions, openUrl } from "./crotchet";

const crotchet = {
	...utils,
	_: lodash,
	moment,
	registerAction,
	globalActions,
	openUrl,
	actions: {},
	dataSources: {},
	_promiseResolvers: {},
	desktop: {},
	getActionPayload() {
		return {
			...utils,
			openUrl,
		};
	},
};

Object.assign(window, crotchet);

utils.dispatch("crotchet-ready");
