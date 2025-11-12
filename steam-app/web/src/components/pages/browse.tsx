// import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
// import { useState, useMemo } from "react";
// import { gamesData } from "@/lib/games-data";
// import { filterGames } from "@/lib/recommendations";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GENRES, type Game } from "@/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { MultiSelect } from "../multi-select";
// import debounce from "lodash.debounce";

export default function BrowsePage() {
	const [q, setQ] = useState("");
	const [offset, setOffset] = useState(0);
	const [price, setPrice] = useState(100);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(true);
	const limit = 20;

	// const [search, setSearch] = useState("");
	// const [showFilters, setShowFilters] = useState(false);
	// const [priceRange, setPriceRange] = useState<
	// 	"all" | "free" | "under20" | "under40" | "over40"
	// >("all");
	// const [sortBy, setSortBy] = useState<"name" | "price" | "score">("name");
	// const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	// const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [filteredGames, setFilteredGames] = useState<Game[]>([]);
	const renderPriceText = (price: number) => {
		switch (price) {
			case 0:
				return <span>Free</span>;
			case 210:
				return <span>All Prices</span>;
			default:
				return <span>Under ${price}</span>;
		}
	};

	// useEffect(() => {
	// 	const c = new AbortController();
	// 	const params = new URLSearchParams({
	// 		limit: String(limit),
	// 		offset: String(offset),
	// 		q: q,
	// 		price: String(price),
	// 	});

	// 	params.append("genres", selectedGenres.join(","));
	// 	console.log("params", params.toString());

	// 	fetch(`/api/games?${params.toString()}`, { signal: c.signal })
	// 		.then((r) => r.json())
	// 		.then(setFilteredGames)
	// 		.catch(() => {});
	// 	return () => c.abort();
	// }, [q, offset, price, selectedGenres]);

	// useEffect(() => {
	// 	return () => {
	// 		debouncedResults.cancel();
	// 	};
	// });

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("searching for", e.target.value);
		setOffset(0);
		setQ(e.target.value);
	};
	// const debouncedResults = useMemo(() => {
	// 	return debounce(handleSearch, 1000);
	// }, []);

	const fetchGames = () => {
		const c = new AbortController();
		const params = new URLSearchParams({
			limit: String(limit),
			offset: String(offset),
			q: q,
			price: String(price),
		});

		params.append("genres", selectedGenres.join(","));
		console.log("params", params.toString());

		fetch(`/api/games?${params.toString()}`, { signal: c.signal })
			.then((r) => r.json())
			.then(setFilteredGames)
			.catch(() => {});
		return () => c.abort();
	};

	return (
		<div
			style={{
				fontFamily: "system-ui",
				background: "#121417",
				color: "#e9edf1",
				flex: 1,
				padding: 16,
				display: "flex",
				flexDirection: "column",
				gap: 16,
			}}
		>
			<div
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					gap: 16,
					border: "1px solid #2a3138",
					background: "#1a1f24",
					borderRadius: 10,
				}}
			>
				<div
					style={{
						display: "flex",
						padding: 12,
						gap: 12,
					}}
				>
					<div className="flex flex-col gap-2 flex-1 min-w-[260px]">
						<Label style={{ fontSize: 16, opacity: 0.8 }} htmlFor="game-search">
							Search Games
						</Label>
						<Input
							id="game-search"
							type="search"
							placeholder="Search"
							value={q}
							onChange={handleSearch}
						/>
					</div>

					<div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
						<Button
							onClick={() => {
								setOffset(Math.max(0, offset - limit));
							}}
							// disabled={offset === 0}
							disabled // TODO: disable for now until figure out search
						>
							Prev
						</Button>
						<Button
							onClick={() => {
								setOffset(offset + limit);
							}}
							disabled // TODO: disable for now until figure out search
						>
							Next
						</Button>
					</div>

					<div
						style={{
							marginLeft: "auto",
							display: "flex",
							alignItems: "flex-end",
						}}
					>
						<Button onClick={() => setShowFilters(!showFilters)}>
							Filters
							<ChevronDown
								strokeWidth={2}
								size={16}
								style={{
									transition: "transform 0.2s",
									transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
								}}
							/>
						</Button>
					</div>
				</div>

				{showFilters && (
					<div
						style={{
							padding: 16,
							display: "flex",
							gap: 16,
							flexWrap: "wrap",
						}}
					>
						<div className="flex flex-col gap-3">
							<Label htmlFor="slider">Price Range</Label>
							<Slider
								id="slider"
								min={0}
								max={210}
								value={[price]}
								onValueChange={(value) => {
									setPrice(value[0]); // TODO: price = free ($0) and ANY not working
								}}
								style={{
									width: 220,
									accentColor: "#a78bfa",
									cursor: "pointer",
								}}
							/>
							<div className="flex items-center justify-between text-muted-foreground text-sm">
								{renderPriceText(price)}
							</div>
						</div>
						<MultiSelect
							className="w-6"
							placeholder="Select Genres"
							options={GENRES.map((g) => ({ label: g, value: g }))}
							onValueChange={setSelectedGenres}
							defaultValue={selectedGenres}
						/>
						<Button onClick={fetchGames}>Search</Button>
					</div>
				)}
			</div>

			<div
				style={{
					background: "#1a1f24",
					border: "1px solid #2a3138",
					borderRadius: 10,
					overflow: "hidden",
				}}
			>
				<Table
				// cellPadding={10}
				// style={{
				// 	borderCollapse: "separate",
				// 	borderSpacing: 0,
				// 	width: "100%",
				// }}
				>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Genres</TableHead>
							<TableHead>Rating</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredGames.map((r, i) => (
							<TableRow
								key={r.id}
								// style={{
								// 	background: i % 2 ? "#171c21" : "transparent",
								// 	borderTop: "1px solid #2a3138",
								// }}
							>
								<TableCell>{r.name}</TableCell>
								<TableCell>
									{r.price == null
										? ""
										: r.price === 0
										? "Free"
										: Number(r.price).toFixed(2)}
								</TableCell>
								<TableCell>{r.genres?.replace(/;/g, ", ") ?? ""}</TableCell>
								<TableCell>{r.score ?? ""}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
