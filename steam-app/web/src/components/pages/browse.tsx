import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { GENRES, type Game } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { MultiSelect } from '@/components/multi-select';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';

export default function BrowsePage() {
	const [q, setQ] = useState('');
	const [offset, setOffset] = useState(0);
	const [price, setPrice] = useState<number | null>(100);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(true);
	const [limit, setLimit] = useState(20);

	// Applied filters (only updated when Search button is clicked)
	const [appliedPrice, setAppliedPrice] = useState<number | null>(100);
	const [appliedGenres, setAppliedGenres] = useState<string[]>([]);
	const [filteredGames, setFilteredGames] = useState<Game[]>([]);

	const renderPriceText = (price: number | null) => {
		switch (price) {
			case 0:
				return <span>Free</span>;
			case null:
				return <span>All Prices</span>;
			default:
				return <span>Under ${price}</span>;
		}
	};

	// Fetch games with current parameters
	const fetchGames = useCallback(() => {
		const c = new AbortController();
		const params = new URLSearchParams({
			limit: String(limit),
			offset: String(offset),
			q: q,
			price: String(appliedPrice),
		});

		params.append('genres', appliedGenres.join(','));
		console.log('params', params.toString());

		fetch(`/api/games?${params.toString()}`, { signal: c.signal })
			.then((r) => r.json())
			.then(setFilteredGames)
			.catch(() => {});
		return () => c.abort();
	}, [limit, offset, q, appliedPrice, appliedGenres]);

	// Apply filters and fetch
	const handleSearchClick = () => {
		setAppliedPrice(price);
		setAppliedGenres(selectedGenres);
		setOffset(0);
	};

	// Debounced search input effect
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchGames();
		}, 500);

		return () => clearTimeout(timer);
	}, [q]);

	// Fetch when offset or limit changes
	useEffect(() => {
		fetchGames();
	}, [offset, limit]);

	// Fetch when applied filters change
	useEffect(() => {
		fetchGames();
	}, [appliedPrice, appliedGenres]);

	return (
		<div
			style={{
				fontFamily: 'system-ui',
				background: '#121417',
				color: '#e9edf1',
				flex: 1,
				padding: 16,
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
			}}>
			<div
				style={{
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
					border: '1px solid #2a3138',
					background: '#1a1f24',
					borderRadius: 10,
				}}>
				<div
					style={{
						display: 'flex',
						padding: 12,
						gap: 12,
					}}>
					<div className='flex flex-col gap-2 flex-1 min-w-[260px]'>
						<Label style={{ fontSize: 16, opacity: 0.8 }} htmlFor='game-search'>
							Search Games
						</Label>
						<Input
							id='game-search'
							type='search'
							placeholder='Search'
							value={q}
							onChange={(e) => {
								setQ(e.target.value);
								setOffset(0);
							}}
						/>
					</div>

					<div
						style={{
							marginLeft: 'auto',
							display: 'flex',
							alignItems: 'flex-end',
						}}>
						<Button onClick={() => setShowFilters(!showFilters)}>
							Filters
							<ChevronDown
								strokeWidth={2}
								size={16}
								style={{
									transition: 'transform 0.2s',
									transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
								}}
							/>
						</Button>
					</div>
				</div>

				{showFilters && (
					<div
						style={{
							padding: 16,
							display: 'flex',
							gap: 16,
							flexWrap: 'wrap',
						}}>
						<div className='flex flex-col gap-3'>
							<Label htmlFor='slider'>Price Range</Label>
							<Slider
								id='slider'
								min={0}
								max={201}
								value={price === null ? [201] : [price]}
								onValueChange={(value) => {
									if (value[0] === 201) {
										// "All Prices" option
										setPrice(null);
									} else {
										setPrice(value[0]);
									}
								}}
								style={{
									width: 220,
									accentColor: '#a78bfa',
									cursor: 'pointer',
								}}
							/>
							<div className='flex items-center justify-between text-muted-foreground text-sm'>
								{renderPriceText(price)}
							</div>
						</div>
						<MultiSelect
							className='w-6'
							placeholder='Select Genres'
							options={GENRES.map((g) => ({ label: g, value: g }))}
							onValueChange={setSelectedGenres}
							defaultValue={selectedGenres}
						/>
						<Button onClick={handleSearchClick}>Search</Button>
					</div>
				)}
			</div>

			<div
				style={{
					background: '#1a1f24',
					border: '1px solid #2a3138',
					borderRadius: 10,
					overflow: 'hidden',
				}}>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Genres</TableHead>
							<TableHead>Rating</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredGames.map((r) => (
							<TableRow
								key={r.id}
								// style={{
								// 	background: i % 2 ? "#171c21" : "transparent",
								// 	borderTop: "1px solid #2a3138",
								// }}
							>
								<TableCell>
									<Link to={`/games/${r.id}`} className='hover:underline'>
										{r.name}
									</Link>
								</TableCell>
								<TableCell>
									{r.price == null
										? ''
										: r.price === 0
										? 'Free'
										: Number(r.price).toFixed(2)}
								</TableCell>
								<TableCell>{r.genres?.replace(/;/g, ', ') ?? ''}</TableCell>
								<TableCell>{r.score ?? ''}</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={4} className='p-2'>
								<div className='w-full flex items-center justify-between'>
									<Select onValueChange={(value) => setLimit(Number(value))}>
										<SelectTrigger>
											<span>{`Show ${limit} results`}</span>
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value='10'>10</SelectItem>
												<SelectItem value='20'>20</SelectItem>
												<SelectItem value='50'>50</SelectItem>
												<SelectItem value='100'>100</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>

									<div
										style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<span className='center mr-2'>
											{offset + 1} - {offset + limit}
										</span>
										<Button
											onClick={() => {
												setOffset(Math.max(0, offset - limit));
											}}
											disabled={offset === 0}>
											Prev
										</Button>
										<Button
											onClick={() => {
												setOffset(offset + limit);
											}}>
											Next
										</Button>
									</div>
								</div>
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</div>
		</div>
	);
}
