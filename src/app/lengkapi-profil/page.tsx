import React from 'react';
import LengkapiProfilClient from './LengkapiProfilClient';

export const runtime = 'edge';

export default function LengkapiProfilPage() {
	return (
		<main className="container mx-auto p-6">
			<LengkapiProfilClient />
		</main>
	);
}
