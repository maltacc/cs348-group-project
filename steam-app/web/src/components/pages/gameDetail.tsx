'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, Users, ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { GameDetail } from '@/types';

export default function GameDetailPage() {
	const params = useParams();
	const gameId = params.id as string;
	// const game = mockGamesData.find((g) => g.id === gameId);
	const [game, setGame] = useState<GameDetail | null>(null);
	// const [isWishlisted, setIsWishlisted] = useState(false);
	// const recommendedGames = game ? getRecommendedGames(game, gamesData) : [];

	useEffect(() => {
		const c = new AbortController();
		const params = new URLSearchParams({
			gameId: gameId,
		});

		console.log('params', params.toString());

		fetch(`/api/games/${gameId}`, { signal: c.signal })
			.then((r) => r.json())
			.then(setGame)
			.catch(() => {});
		return () => c.abort();
	}, [gameId]);

	if (!game) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<h1 className='mb-4 text-2xl font-bold'>Game Not Found</h1>
					<Link to='/browse'>
						<Button>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Browse
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				fontFamily: 'system-ui',
				background: '#121417',
				color: '#e9edf1',
				minHeight: '100vh',
			}}>
			{/* Header */}
			<div
				style={{
					background: '#1a1f24',
					borderBottom: '1px solid #2a3138',
					padding: '48px 16px',
				}}>
				<div style={{ maxWidth: 1200, margin: '0 auto' }}>
					<h1 style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
						{game.name}
					</h1>
					<p style={{ color: '#9ca3af' }}>{game.developer}</p>
				</div>
			</div>

			{/* Content */}
			<div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 16,
					}}>
					{/* Left column - takes up 2/3 on large screens */}
					<div
						style={{
							gridColumn: 'span 2',
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
						}}>
						{/* Stats */}
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
								gap: 12,
							}}>
							<div
								style={{
									padding: 16,
									background: '#1a1f24',
									border: '1px solid #2a3138',
									borderRadius: 8,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										fontSize: 14,
										color: '#9ca3af',
										marginBottom: 8,
									}}>
									<Star style={{ width: 16, height: 16 }} />
									<span>User Score</span>
								</div>
								<p style={{ fontSize: 28, fontWeight: 'bold' }}>
									{game.userScore}%
								</p>
							</div>

							<div
								style={{
									padding: 16,
									background: '#1a1f24',
									border: '1px solid #2a3138',
									borderRadius: 8,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										fontSize: 14,
										color: '#9ca3af',
										marginBottom: 8,
									}}>
									<Star style={{ width: 16, height: 16 }} />
									<span>Metacritic</span>
								</div>
								<p style={{ fontSize: 28, fontWeight: 'bold' }}>
									{game.criticScore ? `${game.criticScore}%` : 'N/A'}
								</p>
							</div>

							<div
								style={{
									padding: 16,
									background: '#1a1f24',
									border: '1px solid #2a3138',
									borderRadius: 8,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										fontSize: 14,
										color: '#9ca3af',
										marginBottom: 8,
									}}>
									<Users style={{ width: 16, height: 16 }} />
									<span>Sentiment</span>
								</div>
								<p
									style={{
										fontSize: 18,
										fontWeight: 'bold',
										textTransform: 'capitalize',
									}}>
									{game.sentiment}
								</p>
							</div>
						</div>

						{/* Description */}
						<div
							style={{
								padding: 20,
								background: '#1a1f24',
								border: '1px solid #2a3138',
								borderRadius: 8,
							}}>
							<h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
								About
							</h2>
							<p style={{ lineHeight: 1.6, color: '#9ca3af' }}>
								{game.description}
							</p>
						</div>

						{/* Tags */}
						<div
							style={{
								padding: 20,
								background: '#1a1f24',
								border: '1px solid #2a3138',
								borderRadius: 8,
							}}>
							<h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
								Tags
							</h2>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
								{game.tags.map((tag) => (
									<Badge key={tag} variant='outline'>
										{tag}
									</Badge>
								))}
							</div>
						</div>
					</div>

					{/* Right column - sidebar */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
						{/* Price and info */}
						<div
							style={{
								padding: 20,
								background: '#1a1f24',
								border: '1px solid #2a3138',
								borderRadius: 8,
							}}>
							<div style={{ marginBottom: 16 }}>
								<span style={{ fontSize: 32, fontWeight: 'bold' }}>
									${game.price}
								</span>
							</div>

							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
								{game.genres.map((genre) => (
									<Badge key={genre}>{genre}</Badge>
								))}
							</div>

							<div
								style={{
									marginTop: 16,
									paddingTop: 16,
									borderTop: '1px solid #2a3138',
								}}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										gap: 8,
										fontSize: 14,
									}}>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}>
										<span style={{ color: '#9ca3af' }}>Release</span>
										<span>
											{game.releaseDate
												? new Date(game.releaseDate).toLocaleDateString()
												: 'Unknown'}
										</span>
									</div>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}>
										<span style={{ color: '#9ca3af' }}>Developer</span>
										<span>{game.developer}</span>
									</div>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
										}}>
										<span style={{ color: '#9ca3af' }}>Publisher</span>
										<span>{game.publisher}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
