import {
	PhotoIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	PlusIcon,
	ArrowPathIcon,
	ListBulletIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon, ShareIcon, UserCircleIcon } from "@heroicons/react/24/solid";

import RegularListItem from "../components/ListItem";

export function List({ data } = {}) {
	if (!data?.length) return null;
	return data.map((item) => <RegularListItem key={item._id} {...item} />);
}

const IconMap = {
	share: ShareIcon,
	shuffle: ArrowPathIcon,
	play: PlayIcon,
	image: PhotoIcon,
	add: PlusIcon,
	"add-circle": PlusCircleIcon,
	search: MagnifyingGlassIcon,
	user: UserCircleIcon,
	list: ListBulletIcon,
};

export function Icon(icon, size = 3.5) {
	const Icon = IconMap[icon] || IconMap.list;

	return <Icon className={`size-${size}`} />;
}
