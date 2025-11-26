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

export type GameDetail = {
	id: number;
	name: string;
	price: number | null;
	description: string;
	releaseDate: string | null;
	developer: string;
	publisher: string;
	score: number | null;
	userScore: number | null;
	criticScore: number | null;
	sentiment: 'positive' | 'mixed' | 'negative';
	genres: string[];
	tags: string[];
};

export type Genres =
	| '360 Video'
	| 'Accounting'
	| 'Action'
	| 'Adventure'
	| 'Animation & Modeling'
	| 'Audio Production'
	| 'Casual'
	| 'Design & Illustration'
	| 'Documentary'
	| 'Early Access'
	| 'Education'
	| 'Episodic'
	| 'Free to Play'
	| 'Game Development'
	| 'Gore'
	| 'Indie'
	| 'Massively Multiplayer'
	| 'Movie'
	| 'Nudity'
	| 'Photo Editing'
	| 'RPG'
	| 'Racing'
	| 'Sexual Content'
	| 'Short'
	| 'Simulation'
	| 'Software Training'
	| 'Sports'
	| 'Strategy'
	| 'Tutorial'
	| 'Utilities'
	| 'Video Production'
	| 'Violent'
	| 'Web Publishing';

export const GENRES: Genres[] = [
	'360 Video',
	'Accounting',
	'Action',
	'Adventure',
	'Animation & Modeling',
	'Audio Production',
	'Casual',
	'Design & Illustration',
	'Documentary',
	'Early Access',
	'Education',
	'Episodic',
	'Free to Play',
	'Game Development',
	'Gore',
	'Indie',
	'Massively Multiplayer',
	'Movie',
	'Nudity',
	'Photo Editing',
	'RPG',
	'Racing',
	'Sexual Content',
	'Short',
	'Simulation',
	'Software Training',
	'Sports',
	'Strategy',
	'Tutorial',
	'Utilities',
	'Video Production',
	'Violent',
	'Web Publishing',
];

export type Tags =
	| 'Story-rich'
	| 'Open World'
	| 'Multiplayer'
	| 'Souls-like'
	| 'Metroidvania'
	| 'Roguelike'
	| 'Cozy'
	| 'Challenging';

export const TAGS: Tags[] = [
	'Story-rich',
	'Open World',
	'Multiplayer',
	'Souls-like',
	'Metroidvania',
	'Roguelike',
	'Cozy',
	'Challenging',
];

export type Rec = {
	id?: number;
	name: string;
	score?: number | null;
	price?: number | null;
	genres?: string | null;
};

export type PriceValue = {
  id: string
  name: string
  price: number
  score: number
  genre: string
  genreAvgPrice: number
  genreAvgScore: number
  genrePriceStddev: number
  genreScoreStddev: number
  priceZScore: number
  scoreZScore: number
  valueRatio: number
  classification: 'Overpriced' | 'Underpriced' | 'Fair Value' | 'Great Value'
}