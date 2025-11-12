export type Game = {
	id: number;
	app_id: number;
	name: string;
	release_date: string | null;
	price: number | null;
	genres: string | null;
	developers: string | null;
	publishers: string | null;
	score: number | null;
	platforms: string | null;
};

export type Genres =
	| "MOBA"
	| "Strategy"
	| "Action"
	| "FPS"
	| "Tactical"
	| "Battle Royale"
	| "Adventure"
	| "Open World"
	| "Souls-like"
	| "Simulation"
	| "RPG"
	| "Farming"
	| "Indie"
	| "Sci-Fi"
	| "Multiplayer"
	| "Survival"
	| "Horror"
	| "Co-op";

export const GENRES: Genres[] = [
	"MOBA",
	"Strategy",
	"Action",
	"FPS",
	"Tactical",
	"Battle Royale",
	"Adventure",
	"Open World",
	"Souls-like",
	"Simulation",
	"RPG",
	"Farming",
	"Indie",
	"Sci-Fi",
	"Multiplayer",
	"Survival",
	"Horror",
	"Co-op",
];

export type Tags =
	| "Story-rich"
	| "Open World"
	| "Multiplayer"
	| "Souls-like"
	| "Metroidvania"
	| "Roguelike"
	| "Cozy"
	| "Challenging";

export const TAGS: Tags[] = [
	"Story-rich",
	"Open World",
	"Multiplayer",
	"Souls-like",
	"Metroidvania",
	"Roguelike",
	"Cozy",
	"Challenging",
];
