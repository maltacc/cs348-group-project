import { useEffect, useState } from 'react';
import { GENRES, type Game } from './types';
import { Route, Routes } from 'react-router-dom';
import BrowsePage from './components/pages/browse';
import Navbar from './components/navbar';
import GameDetailPage from './components/pages/gameDetail';
import DeveloperDuosPage from './components/pages/developerDuos';
import ExplorePage from './components/pages/explore';
import ComparePage from './components/pages/compare';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
	const [q, setQ] = useState('');
	const [rows, setRows] = useState<Game[]>([]);
	const [offset, setOffset] = useState(0);
	const [price, setPrice] = useState(100);
	const [genres, setGenres] = useState<string[]>([]);
	const limit = 20;

	useEffect(() => {
		const c = new AbortController();
		const params = new URLSearchParams({
			limit: String(limit),
			offset: String(offset),
			q: q,
			price: String(price),
		});

		params.append('genres', genres.join(','));
		console.log('params', params.toString());

		fetch(`/api/games?${params.toString()}`, { signal: c.signal })
			.then((r) => r.json())
			.then(setRows)
			.catch(() => {});
		return () => c.abort();
	}, [q, offset, price, genres]);

	const tempHomePage = (
		<div
			style={{
				fontFamily: 'system-ui',
				background: '#121417',
				color: '#e9edf1',
				minHeight: '100vh',
				width: '100%',
			}}>
			<div style={{ width: '95%', margin: '0 auto', padding: 16 }}>
				<h1
					style={{
						margin: '8px 0 16px',
						fontSize: 36,
						fontWeight: 800,
						textAlign: 'center',
					}}>
					Steam Game Explorer
				</h1>

				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						gap: 12,
						flexWrap: 'wrap',
						marginBottom: 12,
						background: '#1a1f24',
						border: '1px solid #2a3138',
						borderRadius: 10,
						padding: 12,
					}}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 6,
							flex: 1,
							minWidth: 260,
						}}>
						<label style={{ fontSize: 12, opacity: 0.8 }}>Search</label>
						<input
							placeholder='search'
							value={q}
							onChange={(e) => {
								setOffset(0);
								setQ(e.target.value);
							}}
							style={{
								padding: 10,
								width: '100%',
								background: '#20262c',
								border: '1px solid #2a3138',
								color: '#e9edf1',
								borderRadius: 8,
								outline: 'none',
							}}
						/>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						<label style={{ fontSize: 12, opacity: 0.8 }}>
							Max Price: ${price}
						</label>
						<input
							type='range'
							min='0'
							max='100'
							step='1'
							value={price}
							onChange={(e) => {
								setOffset(0);
								setPrice(Number(e.target.value));
							}}
							style={{ width: 200, accentColor: '#a78bfa', cursor: 'pointer' }}
						/>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						<label style={{ fontSize: 12, opacity: 0.8 }}>
							Genres: {genres.length > 0 ? genres.join(', ') : 'All'}
						</label>
						<select
							multiple
							value={genres}
							onChange={(e) => {
								setOffset(0);
								const selectedOptions = Array.from(
									e.target.selectedOptions,
									(o) => o.value
								);
								setGenres(selectedOptions);
							}}
							style={{
								padding: 6,
								width: 220,
								height: 120,
								fontSize: 14,
								background: '#20262c',
								border: '1px solid #2a3138',
								color: '#e9edf1',
								borderRadius: 8,
								outline: 'none',
							}}>
							{GENRES.map((g) =>
								g === 'All Genres' ? (
									<option key={g} value=''>
										{g}
									</option>
								) : (
									<option key={g} value={g}>
										{g}
									</option>
								)
							)}
						</select>
					</div>

					<div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
						<button
							onClick={() => setOffset(Math.max(0, offset - limit))}
							style={{
								background: '#20262c',
								border: '1px solid #2a3138',
								color: '#e9edf1',
								padding: '10px 14px',
								borderRadius: 8,
								cursor: 'pointer',
							}}>
							prev
						</button>
						<button
							onClick={() => setOffset(offset + limit)}
							style={{
								background: '#20262c',
								border: '1px solid #2a3138',
								color: '#e9edf1',
								padding: '10px 14px',
								borderRadius: 8,
								cursor: 'pointer',
							}}>
							next
						</button>
					</div>
				</div>

				<div
					style={{
						background: '#1a1f24',
						border: '1px solid #2a3138',
						borderRadius: 10,
						overflow: 'hidden',
					}}>
					<table
						cellPadding={10}
						style={{
							borderCollapse: 'separate',
							borderSpacing: 0,
							width: '100%',
						}}>
						<thead>
							<tr style={{ background: '#20262c' }}>
								<th style={{ textAlign: 'left' }}>Name</th>
								<th style={{ textAlign: 'left', width: '14%' }}>Price</th>
								<th style={{ textAlign: 'left' }}>Genres</th>
								<th style={{ textAlign: 'left', width: '12%' }}>Rating</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r, i) => (
								<tr
									key={r.id}
									style={{
										background: i % 2 ? '#171c21' : 'transparent',
										borderTop: '1px solid #2a3138',
									}}>
									<td>{r.name}</td>
									<td>
										{r.price == null
											? ''
											: r.price === 0
											? 'Free'
											: Number(r.price).toFixed(2)}
									</td>
									<td style={{ color: '#cdd6e0' }}>
										{r.genres?.replace(/;/g, ', ') ?? ''}
									</td>
									<td>{r.score ?? ''}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);

	return (
		<div className='min-h-screen flex flex-col'>
			<Navbar />
			<ScrollToTop />
			<Routes>
				{/* <Route path="/" element={tempHomePage} /> */}
				<Route path='/' element={<BrowsePage />} />
				<Route path='/browse' element={<BrowsePage />} />
				<Route path='/explore' element={<ExplorePage />} />
				<Route path='/games/:id' element={<GameDetailPage />} />
				<Route path='/developer-duos' element={<DeveloperDuosPage />} />
				<Route path='/compare' element={<ComparePage />} />
				<Route path='*' element={<div>404 Not Found</div>} />
			</Routes>
		</div>
	);
}
