import { PassportPage } from './PassportPage';
import { initialEntries } from './state';
import './studio.css';

const PREVIEW = initialEntries(['jp', 'ke', 'th', 'br', 'za', 'pl', 'no']);

export function PassportThumbnail() {
	return (
		<div className="passport-thumbnail" aria-hidden="true">
			<PassportPage entries={PREVIEW} onMove={() => {}} preview />
		</div>
	);
}
