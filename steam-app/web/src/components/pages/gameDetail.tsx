import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, Users, ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { GameDetail, Rec } from '@/types';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

export default function GameDetailPage() {
	const params = useParams();
	const gameId = params.id as string;
	// const game = mockGamesData.find((g) => g.id === gameId);
	const navigate = useNavigate();
	const [game, setGame] = useState<GameDetail | null>(null);

	const [sameGenreGames, setSameGenreGames] = useState<Rec[]>([]);
	const [developerGames, setDeveloperGames] = useState<Rec[]>([]);
	const [recsLoading, setRecsLoading] = useState(false);
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

	// Fetch recommendations after game loads
	useEffect(() => {
		if (!game) return;
		const c = new AbortController();
		setRecsLoading(true);

		Promise.all([
			fetch(`/api/games/${gameId}/recommendations/genre`, { signal: c.signal })
				.then((r) => r.json())
				.catch(() => {}),
			fetch(`/api/games/${gameId}/recommendations/developer`, {
				signal: c.signal,
			})
				.then((r) => r.json())
				.catch(() => {}),
		])
			.then(([genreRecs, devRecs]) => {
				setSameGenreGames(Array.isArray(genreRecs) ? genreRecs : []);
				setDeveloperGames(Array.isArray(devRecs) ? devRecs : []);
			})
			.catch(() => {})
			.finally(() => setRecsLoading(false));

		return () => c.abort();
	}, [game, gameId]);

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
									<Star style={{ width: 16, height: 16, color: '#f59e0b' }} />
									<span>User Score</span>
								</div>
								<p style={{ fontSize: 28, fontWeight: 'bold' }}>
									{game.score}%
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
									<Star style={{ width: 16, height: 16, color: '#f59e0b' }} />
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

				{/* Recommendations Section */}
				<div style={{ marginTop: 48 }}>
					<h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>
						Similar Games
					</h2>

					{/* Same Genre Carousel */}
					<div style={{ marginBottom: 40 }}>
						<h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
							Top Games in{' '}
							{(() => {
								const genres = game.genres ?? [];

								if (genres.length === 0) return 'Similar Genres';
								if (genres.length === 1) return genres[0];
								if (genres.length === 2) return `${genres[0]} and ${genres[1]}`;

								return `${genres.slice(0, -1).join(', ')}, and ${genres.at(
									-1
								)}`;
							})()}
						</h3>

						{recsLoading ? (
							<Card style={{ minWidth: '100%' }}>
								<CardContent className='flex items-center justify-center py-12'>
									<p style={{ color: '#9ca3af' }}>Loading recommendations...</p>
								</CardContent>
							</Card>
						) : sameGenreGames.length > 0 ? (
							<Carousel
								style={{
									width: '100%',
								}}
								opts={{
									align: 'start',
									loop: true,
									skipSnaps: true,
								}}>
								<CarouselContent>
									{sameGenreGames.slice(0, 10).map((game) => (
										<CarouselItem
											key={`${game.id}-genre`}
											className='md:basis-1/2 lg:basis-1/3'>
											<Card
												key={`${game.id}-genre`}
												style={{
													minWidth: 250,
													display: 'flex',
													flexDirection: 'column',
													background: '#1a1f24',
													border: '1px solid #2a3138',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
													marginTop: 4,
												}}
												onClick={() => navigate(`/games/${game.id}`)}
												onMouseEnter={(e) => {
													e.currentTarget.style.borderColor = '#4f46e5';
													e.currentTarget.style.transform = 'translateY(-4px)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.borderColor = '#2a3138';
													e.currentTarget.style.transform = 'translateY(0)';
												}}>
												<CardContent style={{ padding: 16, flex: 1 }}>
													<h4
														style={{
															fontSize: 16,
															fontWeight: 600,
															marginBottom: 12,
															display: '-webkit-box',
															WebkitBoxOrient: 'vertical',
															WebkitLineClamp: 2,
															overflow: 'hidden',
														}}>
														{game.name}
													</h4>
													<div
														style={{
															display: 'flex',
															flexDirection: 'column',
															gap: 8,
														}}>
														{game.score !== null &&
															game.score !== undefined && (
																<div
																	style={{
																		display: 'flex',
																		alignItems: 'center',
																		gap: 8,
																		fontSize: 14,
																	}}>
																	<Star
																		style={{
																			width: 14,
																			height: 14,
																			color: '#f59e0b',
																		}}
																	/>
																	<span style={{ color: '#9ca3af' }}>
																		{game.score}%
																	</span>
																</div>
															)}
														{game.price !== null &&
															game.price !== undefined && (
																<div style={{ fontSize: 14, color: '#9ca3af' }}>
																	${game.price}
																</div>
															)}
														{game.genres && (
															<div
																style={{
																	display: 'flex',
																	flex: 'wrap',
																	gap: 6,
																	marginTop: 8,
																}}>
																{typeof game.genres === 'string'
																	? game.genres
																			.split(',')
																			.slice(0, 2)
																			.map((g) => (
																				<Badge
																					key={g.trim()}
																					variant='outline'
																					style={{ fontSize: 11 }}>
																					{g.trim()}
																				</Badge>
																			))
																	: null}
															</div>
														)}
													</div>
												</CardContent>
											</Card>
										</CarouselItem>
									))}
								</CarouselContent>

								<CarouselPrevious />
								<CarouselNext />
							</Carousel>
						) : (
							<Card style={{ minWidth: '100%' }}>
								<CardContent className='flex items-center justify-center py-12'>
									<p style={{ color: '#9ca3af' }}>
										No recommendations available
									</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Same Developer Carousel */}
					<div>
						<h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
							{(() => {
								const devs = game.developer
									? game.developer
											.split(',')
											.map((d) => d.trim())
											.filter(Boolean)
									: [];
								if (devs.length === 0) return 'More from this developer';
								if (devs.length === 1) return `More from ${devs[0]}`;
								if (devs.length === 2)
									return `More from ${devs[0]} and ${devs[1]}`;
								return `More from ${devs
									.slice(0, -1)
									.join(', ')}, and ${devs.at(-1)}`;
							})()}
						</h3>
						<div>
							{recsLoading ? (
								<Card style={{ minWidth: '100%' }}>
									<CardContent className='flex items-center justify-center py-12'>
										<p style={{ color: '#9ca3af' }}>
											Loading recommendations...
										</p>
									</CardContent>
								</Card>
							) : developerGames.length > 0 ? (
								<Carousel
									style={{
										width: '100%',
									}}
									opts={{
										align: 'start',
										loop: true,
										skipSnaps: true,
									}}>
									<CarouselContent>
										{developerGames.slice(0, 10).map((game) => (
											<CarouselItem
												key={`${game.id}-dev`}
												className='md:basis-1/3 lg:basis-1/4'>
												<Card
													key={`${game.id}-dev`}
													style={{
														minWidth: 250,
														display: 'flex',
														flexDirection: 'column',
														background: '#1a1f24',
														border: '1px solid #2a3138',
														cursor: 'pointer',
														transition: 'all 0.3s ease',
														marginTop: 4,
													}}
													onClick={() => navigate(`/games/${game.id}`)}
													onMouseEnter={(e) => {
														e.currentTarget.style.borderColor = '#4f46e5';
														e.currentTarget.style.transform =
															'translateY(-4px)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.borderColor = '#2a3138';
														e.currentTarget.style.transform = 'translateY(0)';
													}}>
													<CardContent style={{ padding: 16, flex: 1 }}>
														<h4
															style={{
																fontSize: 16,
																fontWeight: 600,
																marginBottom: 12,
																display: '-webkit-box',
																WebkitBoxOrient: 'vertical',
																WebkitLineClamp: 2,
																overflow: 'hidden',
															}}>
															{game.name}
														</h4>
														<div
															style={{
																display: 'flex',
																flexDirection: 'column',
																gap: 8,
															}}>
															{game.score !== null &&
																game.score !== undefined && (
																	<div
																		style={{
																			display: 'flex',
																			alignItems: 'center',
																			gap: 8,
																			fontSize: 14,
																		}}>
																		<Star
																			style={{
																				width: 14,
																				height: 14,
																				color: '#f59e0b',
																			}}
																		/>
																		<span style={{ color: '#9ca3af' }}>
																			{game.score}%
																		</span>
																	</div>
																)}
															{game.price !== null &&
																game.price !== undefined && (
																	<div
																		style={{ fontSize: 14, color: '#9ca3af' }}>
																		${game.price}
																	</div>
																)}
															{game.genres && (
																<div
																	style={{
																		display: 'flex',
																		flex: 'wrap',
																		gap: 6,
																		marginTop: 8,
																	}}>
																	{typeof game.genres === 'string'
																		? game.genres
																				.split(',')
																				.slice(0, 2)
																				.map((g) => (
																					<Badge
																						key={g.trim()}
																						variant='outline'
																						style={{ fontSize: 11 }}>
																						{g.trim()}
																					</Badge>
																				))
																		: null}
																</div>
															)}
														</div>
													</CardContent>
												</Card>
											</CarouselItem>
										))}
									</CarouselContent>

									<CarouselPrevious />
									<CarouselNext />
								</Carousel>
							) : (
								<Card style={{ minWidth: '100%' }}>
									<CardContent className='flex items-center justify-center py-12'>
										<p style={{ color: '#9ca3af' }}>
											No recommendations available
										</p>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
