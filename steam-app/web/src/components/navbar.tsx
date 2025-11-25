import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
	return (
		<nav className="border-b sticky top-0 z-50 container flex h-16 items-center bg-background p-4 gap-2 min-w-full flex-shrink-0 position-relative">
			<div className="m-2">
				<Link to="/" className="font-bold text-lg truncate position-absolute">
					Steam Game Explorer
				</Link>
			</div>
			<div className="flex items-center gap-2">
				{/* <Link to="/">
					<Button variant="ghost">Home</Button>
				</Link> */}
				<Link to="/browse">
					<Button variant="ghost">Browse</Button>
				</Link>
				<Link to="/recommendations">
					<Button variant="ghost">Recommendations</Button>
				</Link>
				<Link to="/compare">
					<Button variant="ghost">Compare</Button>
				</Link>
				<Link to="/developer-duos">
					<Button variant="ghost">Developer Duos</Button>
				</Link>
			</div>
		</nav>
	);
};

export default Navbar;
